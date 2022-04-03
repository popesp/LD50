import {WIDTH_CANVAS, PADDING_CANVAS, OFFSET_DESCRIPTION_CARD} from "../globals.js";
import {SHOP_DATA} from "../data/shop.js";
import GameState from "../gamestate.js";
import {log} from "../debug.js";


const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 100;

const ITEMS_PER_ROW = 5;

const WIDTH_ITEM = 150;
const HEIGHT_ITEM = 210;
const PADDING_ITEM = 5;
const SPACING_ITEM = 20;

const WIDTH_ITEMIMAGE = 141;
const HEIGHT_ITEMIMAGE = 85;

const ANCHOR_X = 300;
const ANCHOR_Y = 310;

function buyItem(item)
{
	log(item);
	if(item.bought < item.quantity && GameState.currency >= item.cost)
	{
		item.bought++;
		GameState.currency -= item.cost;
		GameState.unlocks.push(item.data);
	}
}

let text_gold = null;

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "upgrade_shop"});
	},
	preload: function()
	{
	},
	create: function()
	{
		this.music = this.sound.add("thumpy");
		this.music.loop = true;
		this.music.play();

		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "CARD SHOP", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5, 0);

		// Back Button
		const back_btn = this.add.image(0, 0, "back_arrow");
		back_btn.setOrigin(0);
		back_btn.setDisplaySize(WIDTH_BACK_BUTTON, HEIGHT_BACK_BUTTON);
		back_btn.setPosition(PADDING_CANVAS);
		back_btn.setInteractive({useHandCursor: true});
		back_btn.on("pointerdown", () =>
		{
			this.music.stop();
			this.scene.start("main_menu");
		});

		// gold amount
		text_gold = this.add.text(WIDTH_CANVAS - PADDING_CANVAS*2, PADDING_CANVAS*2, "Gold: " + GameState.currency, {color: "white", fontSize: "40px"}).setOrigin(1, 0);

		// remove sold out cards
		const display_shop = [];
		for(let i = 0; i < SHOP_DATA.length; ++i)
		{
			if(SHOP_DATA[i].bought !== SHOP_DATA[i].quantity)
			{
				display_shop.push(SHOP_DATA[i])
			}
		}
		// purchasable cards
		for(let i = 0; i < display_shop.length; ++i)
		{
			const item = display_shop[i];
			const ITEM_X = ANCHOR_X + (WIDTH_ITEM*(i%ITEMS_PER_ROW)) + SPACING_ITEM*(i%ITEMS_PER_ROW);
			const ITEM_Y = ANCHOR_Y + (HEIGHT_ITEM*Math.floor(i/ITEMS_PER_ROW)) + (SPACING_ITEM*Math.floor(i/ITEMS_PER_ROW)*3);

			const itemsprite = this.add.image(0, 0, "card").setDisplaySize(WIDTH_ITEM, HEIGHT_ITEM);
			const itemimage = this.add.image(0, -41, `card_${item.data.key}`).setDisplaySize(WIDTH_ITEMIMAGE, HEIGHT_ITEMIMAGE);
			const itemname = this.add.text(0, PADDING_ITEM - HEIGHT_ITEM/2, item.data.name, {color: "black", fontSize: "14px"}).setOrigin(0.5, 0);
			const itemdescription = this.add.text(0, OFFSET_DESCRIPTION_CARD, item.data.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_ITEM - PADDING_ITEM*2}}).setOrigin(0.5, 0);
			const itemcost = this.add.text(0, -(HEIGHT_ITEM/2 + PADDING_ITEM), `Cost: ${item.cost}`, {color: "white", fontSize: "20px"}).setOrigin(0.5, 1);

			item.availability = this.add.text(0, HEIGHT_ITEM/2 + PADDING_ITEM, `${item.bought}/${item.quantity}`, {color: "white", fontSize: "20px"}).setOrigin(0.5, 0);

			const container = this.add.container(ITEM_X, ITEM_Y, [itemsprite, itemimage, itemname, itemdescription, itemcost, item.availability]).setSize(WIDTH_ITEM, HEIGHT_ITEM);
			container.setInteractive({useHandCursor: true}).on("pointerdown", () => buyItem(item));
			}
	},
	update: function()
	{
		text_gold.setText("Gold: " + GameState.currency);

		for(const item of SHOP_DATA)
			item.availability.setText(`${item.bought}/${item.quantity}`);
	}
});