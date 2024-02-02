import { GameObjects, Scene, Tweens } from "phaser";
// import { renderText } from "../utils/text-renderer";
// import HeroData from "feh-battles/dec/hero";
// import Team from "../../types/team";
// import IconsSwitcher from "./icons-switcher";

// const hpBarWidth = 60;

class Hero extends GameObjects.Container {
    //     hpBar: GameObjects.Rectangle;
    //     hpBarBackground: GameObjects.Rectangle;
    //     weaponType: GameObjects.Image;
    private sprite: GameObjects.Image;
    private spriteGlow: GameObjects.Image;
    //     hpText: GameObjects.Text;
    //     team: Team;
    //     statuses: string[];
    //     statusesImage: IconsSwitcher;
    //     effectivenessImage: IconsSwitcher;

    //     // todo: simplify constructor
    constructor(scene: Scene, entityData: JSONEntity) {
        super(scene);
        this.setData("hero", entityData);
        //         this.statuses = [];
        this.setName(entityData.id);
        const { value: name } = entityData.components.find((c) => c.type === "Name")!;
        this.sprite = new GameObjects.Image(scene, 0, 0, name, "map").setScale(0.7).setDepth(1);
        this.spriteGlow = new GameObjects.Image(scene, 0, 0, name, "map").setScale(0.7).setDepth(2).setAlpha(0).setTintFill(0xFFFFFF);
        this.add(this.sprite);
        this.add(this.spriteGlow);
        //         this.statusesImage = new IconsSwitcher(scene, 45, 45, []);
        //         this.effectivenessImage = new IconsSwitcher(scene, 0, 0, []);
        //         const hpBarHeight = this.statusesImage.getCenter().y;
        //         this.hpText = renderText(scene, -15, hpBarHeight, data.maxHP, {
        //             fontSize: "18px"
        //         }).setOrigin(1, 0.5);
        //         this.hpBar = new GameObjects.Rectangle(scene, this.hpText.getRightCenter().x, hpBarHeight, hpBarWidth, 5, team === "team1" ? 0x54DFF4 : 0xFA4D69).setOrigin(0, 0).setDepth(2);
        //         this.weaponType = new GameObjects.Image(scene, -30, -40, "weapons", `${data.getWeapon().color}-${data.getWeapon().type}`);
        //         this.hpBarBackground = new GameObjects.Rectangle(scene, this.hpBar.getLeftCenter().x - 1, hpBarHeight - 1, hpBarWidth + 2, 7, 0x000000).setOrigin(0, 0);
        //         this.add(this.hpBarBackground);
        //         this.add(this.hpBar);
        //         this.add(this.weaponType);
        //         this.add(this.statusesImage);
        //         this.add(this.effectivenessImage);
        //         const gradient = this.hpText.context.createLinearGradient(0, 0, 0, this.hpText.height);
        //         gradient.addColorStop(0, "white");
        //         gradient.addColorStop(0.7, this.team === "team1" ? "#54DFF4" : "#FA4D69");
        //         this.hpText.setFill(gradient);
        //         this.add(this.hpText);
        //         this.setSize(120, 120);
    }

    get renderedPosition() {
        const vec = new Phaser.Math.Vector2();
        vec.add(this.sprite.getCenter());
        vec.add({ x: this.x, y: this.y });
        return vec;
    }

    //     createFlashTween() {
    //         this.whiteGlowImage.x = this.image.x;
    //         this.whiteGlowImage.y = this.image.y;
    //         const flashingTween = this.scene.tweens.create({
    //             targets: this.whiteGlowImage,
    //             alpha: 1,
    //             duration: 100,
    //             yoyo: true,
    //         });
    //         return flashingTween as Tweens.Tween;
    //     }

    getInternalHero() {
        return this.data.get("hero") as JSONEntity;
    }

    //     updateHP(newHP: number) {
    //         const { maxHP, stats: { hp } } = this.getInternalHero();
    //         const usedHPValue = newHP ?? hp;
    //         this.hpText.setText(usedHPValue.toString());
    //         const hpRatio = usedHPValue / maxHP;
    //         this.getInternalHero().stats.hp = newHP;
    //         this.hpBar.displayWidth = hpBarWidth * hpRatio;
    //     }

    //     toggleStatuses() {
    //         this.statusesImage.setIcons(this.statuses).setVisible(!!this.statuses.length).toggleIcons();
    //     }
};

export default Hero;
