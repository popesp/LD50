import {WIDTH_CARD, HEIGHT_CARD, PADDING_CARD, WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE, OFFSET_CARDIMAGE, OFFSET_CARDDESCRIPTION} from "./globals.js";


export function makeCardContainer(scene, card, x, y)
{
	const cardsprite = scene.add.image(0, 0, "card").setDisplaySize(WIDTH_CARD, HEIGHT_CARD);
	const cardimage = scene.add.image(0, OFFSET_CARDIMAGE, `card_${card.key}`).setDisplaySize(WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE);
	const cardname = scene.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"}).setOrigin(0.5, 0);
	const carddescription = scene.add.text(0, OFFSET_CARDDESCRIPTION, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}}).setOrigin(0.5, 0);

	return scene.add.container(x, y, [cardsprite, cardimage, cardname, carddescription]).setSize(WIDTH_CARD, HEIGHT_CARD);
}