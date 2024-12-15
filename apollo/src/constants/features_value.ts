interface IFeaturesValue {
  [key: string]: any;
}

const Features = {
  CROSS_SERVER_EMOJIS: "bCSE",
  ATTACHMENT_SIZE_LIMIT: "nASL",
  CONTENT_MESSAGE_LIMIT: "nCML",
};

export const FreePackageFeatures: IFeaturesValue = {
  [Features.CROSS_SERVER_EMOJIS]: true,
  [Features.ATTACHMENT_SIZE_LIMIT]: 10,
  [Features.CONTENT_MESSAGE_LIMIT]: 2000,
};

export const PremiumPackageFeatures: IFeaturesValue = {
  [Features.CROSS_SERVER_EMOJIS]: true,
  [Features.ATTACHMENT_SIZE_LIMIT]: 50,
  [Features.CONTENT_MESSAGE_LIMIT]: 4000,
};
