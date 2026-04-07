import { formatRs } from '../../utils/currency';

const PriceSidebar = ({ cartItems }) => {
    const listTotal = cartItems.reduce((sum, item) => sum + (item.cuttedPrice * item.quantity), 0);
    const discountTotal = cartItems.reduce((sum, item) => sum + ((item.cuttedPrice * item.quantity) - (item.price * item.quantity)), 0);
    const payTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="flex sticky top-16 sm:h-screen flex-col sm:w-4/12 sm:px-1">

            {/* <!-- nav tiles --> */}
            <div className="flex flex-col bg-app-card rounded-sm shadow">
                <h1 className="px-6 py-3 border-b font-medium text-gray-500">PRICE DETAILS</h1>

                <div className="flex flex-col gap-4 p-6 pb-3">
                    <p className="flex justify-between">Price ({cartItems.length} item) <span>{formatRs(listTotal)}</span></p>
                    <p className="flex justify-between">Discount <span className="text-primary-green">- {formatRs(discountTotal)}</span></p>
                    <p className="flex justify-between">Delivery Charges <span className="text-primary-green">FREE</span></p>

                    <div className="border border-dashed"></div>
                    <p className="flex justify-between text-lg font-medium">Total Amount <span>{formatRs(payTotal)}</span></p>
                    <div className="border border-dashed"></div>

                    <p className="font-medium text-primary-green">You will save {formatRs(discountTotal)} on this order</p>

                </div>

            </div>
            {/* <!-- nav tiles --> */}

        </div>
    );
};

export default PriceSidebar;
