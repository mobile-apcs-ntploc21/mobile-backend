import express from "express";
import dateFormat from "dateformat";
import {
  VNPay,
  HashAlgorithm,
  ProductCode,
  VnpLocale,
  Bank,
  dateFormat as VnpDateFormat,
} from "vnpay";

import config from "@/config";

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
    const amount = req.body.amount;
    const bankCode = req.body.bankCode;
    const orderInfo = req.body.orderDescription ?? "'";
    const locale = req.body.locale ?? "vn";

    // Validate the input
    if (amount === null || amount === "" || isNaN(amount)) {
      res.status(404).json({
        message: "Invalid amount",
        success: false,
      });
      return;
    }
    if (orderInfo === null || orderInfo === "") {
      res.status(404).json({
        message: "Invalid order info",
        success: false,
      });
      return;
    }

    // Create the order link
    const date = new Date();
    const expireDate = new Date(date.getTime() + 1 * 15 * 60 * 1000); // 15 minutes
    const orderId = dateFormat(date, "HHmmss");

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

    const paymentUrl = vnpay.buildPaymentUrl(params);

    res.status(200).json({
      message: "Success",
      success: true,
      data: {
        paymentUrl,
      },
    });
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
  res.status(200).send("Return");
  return;
};
