import { addItemsToCart, removeItemsFromCart, applyCoupon } from '../actions/cartAction';

/**
 * Run server-directed cart updates in Redux.
 * @returns {Promise<boolean>} whether cart changed
 */
export async function executeCartAction(cartAction, dispatch) {
    if (!cartAction || typeof cartAction !== 'object' || !cartAction.type) {
        return false;
    }

    switch (cartAction.type) {
        case 'add':
            if (cartAction.success && cartAction.productId) {
                await dispatch(
                    addItemsToCart(cartAction.productId, cartAction.quantity || 1)
                );
                return true;
            }
            return false;
        case 'remove':
            if (cartAction.success && cartAction.productId) {
                await dispatch(removeItemsFromCart(cartAction.productId));
                return true;
            }
            return false;
        case 'apply_coupon':
            if (cartAction.success) {
                await dispatch(
                    applyCoupon({
                        code: cartAction.code,
                        discount: cartAction.discount,
                        discountAmount: cartAction.coupon?.discountAmount || 0,
                        discountPercent: cartAction.coupon?.discountPercent || 0,
                        description: cartAction.coupon?.description || '',
                    })
                );
                return true;
            }
            return false;
        default:
            return false;
    }
}
