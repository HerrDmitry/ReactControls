import * as React from "react";
import * as Flux from "flux";

export interface IElementProperties {
    className?: string;
    style?: React.CSSProperties;
}

export interface IElementState {
    
}

export abstract class HtmlElement<TP extends IElementProperties,TS extends IElementState> extends React.Component<TP,TS> {

}

export interface IUserInputElementProperties extends IElementProperties {
    data?: any;
    propertyName?:string;
    dependsOn?: Array<string>;

    onChange?: (newValue: any) => boolean;
    onChanged?: (value:any)=>void;
}

interface IUserInputElementState extends IElementState {
    value:any;
}

export abstract class UserInputHtmlElement<TP extends IUserInputElementProperties, TS extends IUserInputElementState> extends HtmlElement<TP, TS> {
    protected constructor(props: IUserInputElementProperties) {
        super(props);
        if (props.data && props.propertyName) {
            this.state = { value: props.data[props.propertyName] } as TS;
        } else {
            this.state = { value: "" } as TS;
        }
    }

    protected onChange(newValue: any) {
        if (newValue !== this.state.value) {
            let isValid = this.validatePrivate(newValue);

            if (typeof this.props.onChange == "function") {
                isValid = this.props.onChange(newValue);
            }

            if (isValid) {
                this.setValue(newValue);
                this.fireOnChanged(newValue);
                this.setState({ value: newValue } as TS);
            }
        }
    }

    private fireOnChanged(value: any) {
        if (typeof this.props.onChanged == "function") {
            this.props.onChanged(value);
        }
    }

    private validatePrivate(value: any): boolean {
        if (typeof this.validate == "function") {
            return this.validate(value);
        }

        return true;
    }

    protected abstract validate(value: any):boolean;

    protected setValue(value:any) {
        if (this.props.data && this.props.propertyName) {
            this.props.data[this.props.propertyName] = value;
        }
    }
}