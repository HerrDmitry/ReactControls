import * as HtmlElement from "htmlElement";
import * as React from "react";

export interface ITextboxProperties extends HtmlElement.IUserInputElementProperties {
    format: string | ({ precision?: number, scale?: number });
}

export interface ITextboxState extends HtmlElement.IUserInputElementState {
}

export class Textbox extends HtmlElement.UserInputHtmlElement<ITextboxProperties, ITextboxState> {
    constructor(props: ITextboxProperties) {
        super(props);
    }

    public render() {
        return <input
            className={this.props.className}
            value={this.state.value}
            onChange={(event) => this.onChange((event.target as HTMLInputElement).value)} />;
    }
}
 