import { CSSATRuleExpression } from "./ast";
import { SyntheticCSSStyleDeclaration } from "./declaration";
import { SyntheticCSSObject, SyntheticCSSObjectSerializer } from "./base";
import { SyntheticCSSStyleRule, diffSyntheticCSSStyleRules } from "./style-rule";
import { ISerializer, serialize, deserialize, serializable, ISerializedContent, ITreeWalker } from "@tandem/common";
import {
  BaseSyntheticObjectEdit,
  SetValueEditActon,
  MoveChildEditAction,
  InsertChildEditAction,
  RemoveChildEditAction,
} from "@tandem/sandbox";

export interface ISerializedSyntheticCSSMediaRule {
  media: string[];
  cssRules: Array<ISerializedContent<any>>;
}

class SyntheticCSSMediaRuleSerializer implements ISerializer<SyntheticCSSMediaRule, ISerializedSyntheticCSSMediaRule> {
  serialize({ media, cssRules }: SyntheticCSSMediaRule) {
    return {
      media: media,
      cssRules: cssRules.map(serialize)
    };
  }
  deserialize({ media, cssRules }: ISerializedSyntheticCSSMediaRule, dependencies) {
    const rule = new SyntheticCSSMediaRule(media);
    cssRules.forEach((cs) => rule.cssRules.push(deserialize(cs, dependencies)));
    return rule;
  }
}

export class SyntheticCSSMediaRuleEdit extends BaseSyntheticObjectEdit<SyntheticCSSMediaRule> {

  static readonly SET_MEDIA_EDIT       = "setMediaEdit";
  static readonly INSERT_CSS_RULE_EDIT = "insertCSSRuleAtEdit";
  static readonly MOVE_CSS_RULE_EDIT   = "moveCSSRuleEdit";
  static readonly REMOVE_CSS_RULE_EDIT = "removeCSSRuleEdit";

  insertRule(rule: SyntheticCSSStyleRule, index: number) {
    return this.addAction(new InsertChildEditAction(SyntheticCSSMediaRuleEdit.INSERT_CSS_RULE_EDIT, this.target, rule, index));
  }

  moveRule(rule: SyntheticCSSStyleRule, index: number) {
    return this.addAction(new MoveChildEditAction(SyntheticCSSMediaRuleEdit.MOVE_CSS_RULE_EDIT, this.target, rule, index));
  }

  removeRule(rule: SyntheticCSSStyleRule) {
    return this.addAction(new RemoveChildEditAction(SyntheticCSSMediaRuleEdit.REMOVE_CSS_RULE_EDIT, this.target, rule));
  }

  setMedia(value: string[]) {
    return this.addAction(new SetValueEditActon(SyntheticCSSMediaRuleEdit.SET_MEDIA_EDIT, this.target, value));
  }

  addDiff(newMediaRule: SyntheticCSSMediaRule) {

    if (this.target.media.join("") !== newMediaRule.media.join("")) {
      this.setMedia(newMediaRule.media);
    }

    diffSyntheticCSSStyleRules(this.target.cssRules, newMediaRule.cssRules).accept({
      visitInsert: ({ index, value }) => {
        this.insertRule(value, index);
      },
      visitRemove: ({ index }) => {
        this.removeRule(this.target.cssRules[index]);
      },
      visitUpdate: ({ originalOldIndex, patchedOldIndex, newValue, newIndex }) => {
        const oldRule = this.target.cssRules[originalOldIndex];
        if (originalOldIndex !== patchedOldIndex) {
          this.moveRule(oldRule, newIndex);
        }
        this.addChildEdit(oldRule.createEdit().addDiff(newValue));
      }
    })

    return this;
  }
}

@serializable(new SyntheticCSSObjectSerializer(new SyntheticCSSMediaRuleSerializer()))
export class SyntheticCSSMediaRule extends SyntheticCSSObject {
  public cssRules: SyntheticCSSStyleRule[];

  constructor(public media: string[]) {
    super();
    this.cssRules = [];
  }

  get cssText() {
    return `@media ${this.media.join(" ")} {
      ${this.cssRules.map((rule) => rule.cssText).join("\n")}
    }`;
  }

  clone(deep?: boolean) {
    const clone = new SyntheticCSSMediaRule(this.media.concat());
    if (deep) {
      for (let i = 0, n = this.cssRules.length; i < n; i++) {
        clone.cssRules.push(this.cssRules[i].clone(deep));
      }
    }
    return this.linkClone(clone);
  }

  createEdit() {
    return new SyntheticCSSMediaRuleEdit(this);
  }

  visitWalker(walker: ITreeWalker) {
    this.cssRules.forEach(rule => walker.accept(rule));
  }
}