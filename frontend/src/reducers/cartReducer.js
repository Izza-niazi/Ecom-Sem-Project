import {
    ADD_TO_CART,
    EMPTY_CART,
    REMOVE_FROM_CART,
    SAVE_SHIPPING_INFO,
    APPLY_COUPON,
    CLEAR_COUPON,
} from "../constants/cartConstants";

export const cartReducer = (
    state = { cartItems: [], shippingInfo: {}, coupon: null },
    { type, payload }
) => {
    switch (type) {
        case ADD_TO_CART:
            const item = payload;
            const isItemExist = state.cartItems.find((el) => el.product === item.product);

            if (isItemExist) {
                return {
                    ...state,
                    cartItems: state.cartItems.map((el) =>
                        el.product === isItemExist.product ? item : el
                    ),
                }
            } else {
                return {
                    ...state,
                    cartItems: [...state.cartItems, item],
                }
            }
        case REMOVE_FROM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter((el) => el.product !== payload)
            }
        case EMPTY_CART:
            return {
                ...state,
                cartItems: [],
                coupon: null,
            }
        case APPLY_COUPON:
            return {
                ...state,
                coupon: payload,
            }
        case CLEAR_COUPON:
            return {
                ...state,
                coupon: null,
            }
        case SAVE_SHIPPING_INFO:
            return {
                ...state,
                shippingInfo: payload
            }
        default:
            return state;
    }
}