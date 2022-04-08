import {WIDTH_CARD, HEIGHT_CARD, PADDING_CARD, WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE, OFFSET_CARDIMAGE, FONT_DEFAULT} from "./globals.js";

const OFFSET_CARDDESCRIPTION = 52;


export function makeCardContainer(scene, card, x, y)
{
	const cardsprite = scene.add.image(0, 0, "card").setDisplaySize(WIDTH_CARD, HEIGHT_CARD);
	const cardimage = scene.add.image(0, OFFSET_CARDIMAGE, `card_${card.key}`).setDisplaySize(WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE);
	const cardname = scene.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {fontFamily: FONT_DEFAULT, color: "black", fontSize: "14px"}).setOrigin(0.5, 0);
	const carddescription = scene.add.text(0, OFFSET_CARDDESCRIPTION, card.description, {fontFamily: FONT_DEFAULT, color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}}).setOrigin(0.5);

	return scene.add.container(x, y, [cardsprite, cardimage, cardname, carddescription]).setSize(WIDTH_CARD, HEIGHT_CARD);
}