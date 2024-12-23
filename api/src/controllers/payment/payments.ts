import express from "express";
import dateFormat from "dateformat";
import {
  VNPay,
  HashAlgorithm,
  ProductCode,
  VnpLocale,
  VerifyReturnUrl,
  dateFormat as VnpDateFormat,
  VerifyIpnCall,
  IpnFailChecksum,
  IpnOrderNotFound,
  InpOrderAlreadyConfirmed,
  IpnSuccess,
  IpnUnknownError,
} from "vnpay";
import { v4 as uuidv4 } from "uuid";

import config from "@/config";
import graphQLClient from "@/utils/graphql";
import {
  ordersQueries,
  paymentLogQueries,
  userSubscriptionQueries,
  packagesQueries,
} from "@/graphql/queries";
import {
  ordersMutations,
  paymentLogMutations,
  userSubscritpionMutation,
} from "@/graphql/mutations";

// Initialize VNPay
// https://vnpay.js.org/create-payment-url
const vnpay = new VNPay({
  tmnCode: config.VNPAY_TMNCODE,
  secureSecret: config.VNPAY_SECRET_KEY,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: HashAlgorithm.SHA512,

  enableLog: true,
});

const setOrderStatus = async (orderId: string, status: string) => {
  const statuses = ["Pending", "Paid", "Failed", "Chargeback", "Refunded"];

  if (!statuses.includes(status)) {
    throw new Error("Invalid status!");
  }

  const order = await graphQLClient().request(
    ordersMutations.UPDATE_ORDER_STATUS,
    {
      id: orderId,
      status: status,
    }
  );

  return order;
};

const createPaymentLog = async (
  userId: string,
  orderId: string,
  request: string,
  response: string,
  transactionId: string,
  logType: string
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const logTypes = ["authorize", "redirect", "IPN"];
  if (!logTypes.includes(logType)) {
    throw new Error("Invalid log type");
  }

  const paymentLog = await graphQLClient().request(
    paymentLogMutations.CREATE_PAYMENT_LOG,
    {
      user_id: userId,
      order_id: orderId,
      request: request,
      response: response,
      transaction_id: transactionId,
      log_type: logType,
    }
  );

  return paymentLog;
};

// ===================

export const createOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let ipAddress =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      "";

    if (typeof ipAddress !== "string") {
      ipAddress = ipAddress[0];
    }

    // Get the input
    const uid = req.body.uid ?? res.locals.uid;
    const packageId = req.body.packageId;
    const bankCode = req.body.bankCode;
    let orderInfo = req.body.orderDescription ?? "";
    const locale = req.body.locale ?? "vn";

    // Get the package
    if (!packageId) {
      res.status(400).json({
        message: "Package ID is required",
        success: false,
      });

      return;
    }

    const packageData = await graphQLClient().request(
      packagesQueries.GET_PACKAGE,
      {
        package_id: packageId,
      }
    );

    if (packageData.package === null) {
      res.status(404).json({
        message: "Package not found",
        success: false,
      });

      return;
    }

    // Create an Order document
    const amount = packageData.package.base_price;
    const date = new Date();
    const expireDate = new Date(date.getTime() + 1 * 15 * 60 * 1000); // 15 minutes
    const transactionId = uuidv4();

    const order = await graphQLClient().request(ordersMutations.CREATE_ORDER, {
      user_id: uid,
      package_id: packageId,
      amount: amount,
      status: "Pending",
      transaction_id: transactionId,
    });
    const orderId = order.createOrder.id;
    orderInfo = `${uid},${packageId},${orderId},${packageData.package.name},${packageData.package.base_price}`;

    // Create the order link
    let params: any = {
      vnp_Amount: amount,
      vnp_IpAddr: ipAddress,
      vnp_TxnRef: transactionId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_Locale: locale ? VnpLocale.VN : VnpLocale.EN,
      vnp_ExpireDate: VnpDateFormat(expireDate),
      vnp_CreateDate: VnpDateFormat(date),
      vnp_ReturnUrl: req.body?.returnUrl || config.VNPAY_RETURN_URL,
    };
    if (bankCode !== null && bankCode !== "") {
      params["vnp_BankCode"] = bankCode;
    }

    // Build the payment URL
    const paymentUrl = vnpay.buildPaymentUrl(params);
    const response: any = {
      message: "Success",
      success: true,
      data: {
        paymentUrl,
      },
    };

    // Create an payment logs
    const paymentLog = await createPaymentLog(
      uid,
      orderId,
      JSON.stringify(params),
      JSON.stringify(response),
      transactionId,
      "authorize"
    );

    // Return the status and reponse.
    res.status(200).json(response);
  } catch (error) {
    next(error);
    return;
  }
};

export const returnOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let verify: VerifyReturnUrl;

    const query: any = req.query;
    const orderInfo: string = query.vnp_OrderInfo;
    verify = vnpay.verifyReturnUrl(query);

    // Get the UID and packageID
    const [uid, packageId, orderId, packageName, amount] = orderInfo.split(",");

    if (!verify.isVerified || !verify.isSuccess) {
      // Create a payment log
      const paymentLog = await createPaymentLog(
        uid,
        orderId,
        JSON.stringify(query),
        JSON.stringify(verify),
        query.vnp_TxnRef,
        "redirect"
      );

      // Set failed payment order
      setOrderStatus(orderId, "Failed");

      // Return the status and reponse.
      const message = verify.isVerified
        ? "Payment failed"
        : "Invalid signature";

      res.status(404).json({
        message: message,
        success: false,
      });

      return;
    }

    // Create a payment log
    const paymentLog = await createPaymentLog(
      uid,
      orderId,
      JSON.stringify(query),
      JSON.stringify(verify),
      query.vnp_TxnRef,
      "redirect"
    );

    res.status(200).json({
      message: "Payment success",
      success: true,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const ipnOrder = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let verify: VerifyIpnCall;

    const query: any = req.query;
    const orderInfo: string = query.vnp_OrderInfo;
    verify = vnpay.verifyIpnCall(query);

    const [uid, packageId, orderId, packageName, amount] = orderInfo.split(",");

    if (!verify.isVerified) {
      return res.json(IpnFailChecksum);
    }

    // Find the order in the database
    const order = await graphQLClient().request(
      ordersQueries.GET_ORDER_BY_TRANSACTION,
      {
        transaction_id: query.vnp_TxnRef,
      }
    );
    console.log("order: ", order);

    // If the order not found in the database
    if (
      order.orderByTransaction === null ||
      order.orderByTransaction.id !== orderId
    ) {
      return res.json(IpnOrderNotFound);
    }

    // If the payment amount does not match
    if (order.orderByTransaction.amount !== verify.vnp_Amount) {
      return res.json(IpnFailChecksum);
    }

    // If the order has been paid before
    if (order.orderByTransaction.status === "Paid") {
      return res.json(InpOrderAlreadyConfirmed);
    }

    console.log("We are here!");

    // Update the order status
    const updatedOrder = await setOrderStatus(orderId, "Paid");

    // Then update the payment log to tell that the payment is successful
    const paymentLog = await createPaymentLog(
      uid,
      orderId,
      JSON.stringify(query),
      JSON.stringify(verify),
      query.vnp_TxnRef,
      "IPN"
    );

    // Mutate the subscription to user
    const userSubscription = await graphQLClient().request(
      userSubscritpionMutation.UPDATE_USER_PACKAGE_SUBSCRIPTION,
      {
        user_id: uid,
        package_id: packageId,
      }
    );

    res.json(IpnSuccess);
    return;
  } catch (error) {
    console.error(`IPN Verify error (controllers/payment): ${error}`);

    res.json(IpnUnknownError);
    return;
  }
};

// Get orders of the user
export const getOrders = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const uid = res.locals.uid;

    const orders = await graphQLClient().request(
      ordersQueries.GET_ORDERS_BY_USER,
      {
        user_id: uid,
      }
    );

    res.status(200).json({
      orders: orders.ordersByUser,
    });
  } catch (error) {
    next(error);
  }
};
