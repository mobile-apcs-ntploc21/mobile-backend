interface IFeaturesValue {
  [key: string]: any;
}

const Features = {
  CROSS_SERVER_EMOJIS: "bCSE",
  ATTACHMENT_SIZE_LIMIT: "nASL",
};

const FreePackageFeatures: IFeaturesValue = {
  [Features.CROSS_SERVER_EMOJIS]: true,
  [Features.ATTACHMENT_SIZE_LIMIT]: 10,
};

const PremiumPackageFeatures: IFeaturesValue = {
  [Features.CROSS_SERVER_EMOJIS]: true,
  [Features.ATTACHMENT_SIZE_LIMIT]: 50,
};
