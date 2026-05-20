import mobiles from '../assets/images/Categories/phone.png';
import fashion from '../assets/images/Categories/fashion.png';
import electronics from '../assets/images/Categories/electronics.png';
import home from '../assets/images/Categories/home.png';
import travel from '../assets/images/Categories/travel.png';
import appliances from '../assets/images/Categories/appliances.png';
import furniture from '../assets/images/Categories/furniture.png';
import beauty from '../assets/images/Categories/beauty.png';
import grocery from '../assets/images/Categories/grocery.png';

const defaultIcon = electronics;

/** Map category names (from DB) to tile icons — substring match, then default. */
export function iconForCategory(name) {
    if (!name) return defaultIcon;
    const lower = String(name).toLowerCase();
    if (lower.includes('mobile') || lower.includes('phone')) return mobiles;
    if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('wear')) return fashion;
    if (lower.includes('electronic') || lower.includes('laptop') || lower.includes('computer')) return electronics;
    if (lower.includes('home') && !lower.includes('appliance')) return home;
    if (lower.includes('travel') || lower.includes('luggage')) return travel;
    if (lower.includes('appliance')) return appliances;
    if (lower.includes('furniture') || lower.includes('sofa')) return furniture;
    if (lower.includes('grocery') || lower.includes('food')) return grocery;
    if (lower.includes('beauty') || lower.includes('toy')) return beauty;
    return defaultIcon;
}
