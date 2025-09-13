import { Dimensions } from "react-native";

export const Width = Dimensions.get('window').width;
export const Height = Dimensions.get('window').height;
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
export const horizontalScale = size => (Width / guidelineBaseWidth) * size;
export const verticalScale = size => (Height / guidelineBaseHeight) * size;

// Conversion rates
export const SUPER_COIN_TO_USDT = 0.00006; // 1 Super Coin = 0.00006 USDT