import {WIDTH_CANVAS, PADDING_CANVAS} from "../globals.js";


export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "scene_rewards"});
	},
	create: function()
	{
		this.music = this.sound.add("spook");
		this.music.loop = true;
		this.music.play();

		this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "Select a card pack to add to your deck", {color: "white", fontSize: "40px"}).setOrigin(0.5, 0);
	}
});