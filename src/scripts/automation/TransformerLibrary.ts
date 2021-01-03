import {ITransformer} from './Handler.js'

export class TransformerLibrary{
  private _templates:ITransformer[] = []
  
  constructor(){
    this._templates.push(...TransformerLibrary.defaultTransformers())
    this._templates.push(...this.getCustomTransformers())    
  }

  public addTransformerTemplate(newTemplate:ITransformer){
    this._templates.push(newTemplate);
  }

  public removeTransformerTemplate(templateName: string){
    this._templates = this._templates.filter(el => el.name != templateName);
  }

  private getCustomTransformers(){
    let customTransformers: ITransformer[] = [];
    //read from the globally stored transformers
    //read from this user's stored transformers
    //read from transformers.json
    return customTransformers;
  }

  get templates(){return this._templates;}

  static defaultTransformers():ITransformer[]{
    let defaultTransformers: ITransformer[] = [];
    //should return a list of default transformers

    //Combat
    // Range Penalty
    // Multi Action Penalty
    // Cover Penalty
    // Recoil
    // Unstable Platform
    // Double Tap Edge
    // Target Parry/Toughness
    // Gritty Damage
    // ReRoll w/ Benny
    return defaultTransformers;
  }
}