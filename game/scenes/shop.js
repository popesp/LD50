import {WIDTH_CANVAS, PADDING_CANVAS, WIDTH_CARD, HEIGHT_CARD, PADDING_CARD} from "../globals.js";
import {makeCardContainer} from "../helpers.js";
import {SHOP_DATA} from "../data/shop.js";
import GameState from "../gamestate.js";
import {log} from "../debug.js";


const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 100;

const ITEMS_PER_ROW = 5;
const SPACING_ITEM_X = 20;
const SPACING_ITEM_Y = 60;


function buyItem(item)
{
	log(item);
	if(item.bought < item.quantity && GameState.currency >= item.cost)
	{
		item.bought++;
		GameState.currency -= item.cost;
		GameState.unlocks.push(item.card);
	}

	text_gold.setText("Gold: " + GameState.currency);

	for(const item of SHOP_DATA)
		item.availability.setText(`${item.bought}/${item.quantity}`);
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

		// purchasable cards
		const ANCHOR_X = 300;
		const ANCHOR_Y = 300;
		for(let index_item = 0; index_item < SHOP_DATA.length; ++index_item)
		{
			const item = SHOP_DATA[index_item];
			const row = Math.floor(index_item/ITEMS_PER_ROW);
			const col = index_item%ITEMS_PER_ROW;

			const ITEM_X = ANCHOR_X + col*(WIDTH_CARD + SPACING_ITEM_X);
			const ITEM_Y = ANCHOR_Y + row*(HEIGHT_CARD + SPACING_ITEM_Y);

			const cardcontainer = makeCardContainer(this, item.card, ITEM_X, ITEM_Y);

			cardcontainer.add(this.add.text(0, -(HEIGHT_CARD/2 + PADDING_CARD), `Cost: ${item.cost}`, {color: "white", fontSize: "20px"}).setOrigin(0.5, 1));
			item.availability = this.add.text(0, HEIGHT_CARD/2 + PADDING_CARD, `${item.bought}/${item.quantity}`, {color: "white", fontSize: "20px"}).setOrigin(0.5, 0);
			cardcontainer.add(item.availability);

			cardcontainer.setInteractive({useHandCursor: true}).on("pointerdown", () => buyItem(item));
		}
	}
});