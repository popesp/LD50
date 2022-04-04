import {CARD_DATA} from "./data/cards.js";
import {SHOP_DATA} from "./data/shop.js";


export default {
	collection: Object.entries(CARD_DATA).map(card => ({card, collected: false})),
	shop: SHOP_DATA.map(item => ({...item, bought: false})),
	currency: 0,
	state_run: null
};