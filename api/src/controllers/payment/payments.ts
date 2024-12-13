import express from "express";
import dateFormat from "dateformat";
import {
  VNPay,
  HashAlgorithm,
  ProductCode,
  VnpLocale,
  VerifyReturnUrl,
  dateFormat as VnpDateFormat,
} from "vnpay";
import { v4 as uuidv4 } from "uuid";

import config from "@/config";
import graphQLClient from "@/utils/graphql";
import {
  ordersQueries,
  paymentLogQueries,
  packagesQueries,
} from "@/graphql/queries";
import { ordersMutations, paymentLogMutations } from "@/graphql/mutations";

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

    console.log("IP: ", ipAddress);

    // Get the input
    const uid = res.locals.uid;
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

    const amount = packageData.package.base_price;
    orderInfo = `${uid} buy package ${packageId} with amount ${amount}`;

    // Create the order link
    const date = new Date();
    const expireDate = new Date(date.getTime() + 1 * 15 * 60 * 1000); // 15 minutes
    const orderId = uuidv4();

    var params: any = {
      vnp_Amount: amount,
      vnp_IpAddr: ipAddress,
      vnp_TxnRef: orderId,
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

    // Create an orders and payment logs
    const order = await graphQLClient().request(ordersMutations.CREATE_ORDER, {
      user_id: uid,
      package_id: packageId,
      amount: amount,
      status: "Pending",
      transaction_id: orderId,
    });

    const paymentLog = await graphQLClient().request(
      paymentLogMutations.CREATE_PAYMENT_LOG,
      {
        user_id: uid,
        order_id: order.createOrder.id,
        request: JSON.stringify(params),
        response: JSON.stringify(response),
        transaction_id: orderId,
        log_type: "authorize",
      }
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
    verify = vnpay.verifyReturnUrl(query);

    if (!verify.isVerified) {
      res.status(404).json({
        message: "Invalid signature",
        success: false,
      });

      return;
    }

    if (!verify.isSuccess) {
      res.status(404).json({
        message: "Payment failed",
        success: false,
      });

      return;
    }

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
