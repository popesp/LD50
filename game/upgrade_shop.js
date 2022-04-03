const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 100;

const ITEMS_PER_ROW = 5;

const WIDTH_ITEM = 150;
const HEIGHT_ITEM = 210;
const PADDING_ITEM = 5;
const SPACING_ITEM = 20;

const WIDTH_ITEMIMAGE = 141;
const HEIGHT_ITEMIMAGE = 85;


function makeItemContainer(scene, item, x, y)
{
	const itemsprite = scene.add.image(0, 0, "card");
	itemsprite.setDisplaySize(WIDTH_ITEM, HEIGHT_ITEM);

	const itemimage = scene.add.image(0, -41, `card_${item.data.key}`);
	itemimage.setDisplaySize(WIDTH_ITEMIMAGE, HEIGHT_ITEMIMAGE);

	const itemname = scene.add.text(0, PADDING_ITEM - HEIGHT_ITEM/2, item.data.name, {color: "black", fontSize: "14px"});
	itemname.setOrigin(0.5, 0);

	const itemdescription = scene.add.text(0, OFFSET_DESCRIPTION, item.data.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_ITEM - PADDING_ITEM*2}});
	itemdescription.setOrigin(0.5, 0);

	const itemavailability = scene.add.text(0, HEIGHT_ITEM/2+PADDING_ITEM*2, `${item.bought}/${item.quantity}`, {color: "white", fontSize: "20px"})
	itemavailability.setOrigin(0.5);

	const itemcost = scene.add.text(0, -(HEIGHT_ITEM/2+PADDING_ITEM*2), `Cost: ${item.cost}`, {color: "white", fontSize: "20px"})
	itemcost.setOrigin(0.5);

	const itemcontainer = scene.add.container(x, y, [itemsprite, itemimage, itemname, itemdescription, itemavailability, itemcost]);
	
	return itemcontainer;
}

function buyItem(scene, item)
{
	console.log(item);
	if(item.bought < item.quantity && GameState.currency >= item.cost)
	{
		item.bought++;
		GameState.currency -= item.cost;
	}

	drawShop(scene)
}

function drawShop(scene)
{
	collectGarbage();

	// Points remaining
	const points_text = scene.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "Gold: " + GameState.currency, {color: "white", fontSize: "40px"});
	points_text.setOrigin(1, 0);
	points_text.setPosition(WIDTH_CANVAS - PADDING_CANVAS*2, PADDING_CANVAS*2);
	garbageBin.push(points_text);

	const ANCHOR_X = 300;
	const ANCHOR_Y = 300;
	for(let i = 0; i < SHOP_DATA.length; ++i)
	{
		const ITEM_X = ANCHOR_X + (WIDTH_ITEM*(i%ITEMS_PER_ROW)) + SPACING_ITEM*(i%ITEMS_PER_ROW);
		const ITEM_Y = ANCHOR_Y + (HEIGHT_ITEM*Math.floor(i/ITEMS_PER_ROW)) + (SPACING_ITEM*Math.floor(i/ITEMS_PER_ROW)*3);
		const item = SHOP_DATA[i];

		const itemcontainer = makeItemContainer(scene, item, ITEM_X, ITEM_Y);
		itemcontainer.setSize(WIDTH_ITEM, HEIGHT_ITEM);
		if(item.bought < item.quantity)
		{
			itemcontainer.setInteractive({useHandCursor: true});
			itemcontainer.on("pointerdown", () => buyItem(scene, item));
		}
		garbageBin.push(itemcontainer);
	}
}

const upgrade_shop = new Phaser.Class({
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
		this.music.play()
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "CARD SHOP", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5, 0);

		

		// Back Button
		const back_btn = this.add.image(0, 0, "back_arrow");
		back_btn.setOrigin(0);
		back_btn.setDisplaySize(WIDTH_BACK_BUTTON, HEIGHT_BACK_BUTTON);
		back_btn.setPosition(PADDING_CANVAS)
		back_btn.setInteractive({useHandCursor: true});
		back_btn.on("pointerdown", () => {
			collectGarbage()
			this.music.stop();
			this.scene.start("main_menu")
		});

		drawShop(this);	

	},
	update: function()
	{

	}
});