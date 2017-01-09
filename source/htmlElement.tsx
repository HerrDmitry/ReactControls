import * as React from "react";
import * as Flux from "flux";

export interface IElementProperties { 
    className?: string;
    style?: React.CSSProperties;
    key?:string;
}

export interface IElementState {
    
}

export abstract class HtmlElement<TP extends IElementProperties,TS extends IElementState> extends React.Component<TP,TS> {

}

export interface IFluxPayload {
    id?: string;
    value: any;
    sender: any;
}

export interface IUserInputElementProperties extends IElementProperties {
    data?: any; 
    propertyName?:string;
    dependsOn?: Array<string>;
    flux?: Flux.Dispatcher<IFluxPayload>;

    onChange?: (newValue: any) => boolean;
    onChanged?: (value:any)=>void;
}

export interface IUserInputElementState extends IElementState {
    value: any;
    isValid:boolean;
}

export interface IValidationParams {
    isRequired?: boolean;
    isForced?: boolean;
    minValue?: string | number;
    maxValue?: string | number;
    errorClassName?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any, dataSource?: any) => { isValid: boolean, canUpdate?: boolean };
}

export abstract class UserInputHtmlElement<TP extends IUserInputElementProperties, TS extends IUserInputElementState> extends HtmlElement<TP, TS> {
    protected constructor(props: IUserInputElementProperties) {
        super(props);
        this.state = { value: "", isValid: true } as TS;
        this.validateState(props);

        if (this.props.flux && typeof this.props.flux.register == "function") {
            this.props.flux.register((payload) => this.onFluxDispatch(payload));
        }
    }
     
    public componentWillReceiveProps(nextProps: TP): void {
        this.validateState(nextProps);
    }

    protected onChange(newValue: any) {
        if (newValue !== this.state.value) {
            const isValid = this.validate(this.props, newValue);

            if (typeof this.props.onChange == "function") {
                if (!this.props.onChange(newValue)) {
                    return;
                }
            }

            this.setValue(newValue);
            this.fireOnChanged(newValue);
            this.setState({ value: newValue, isValid } as TS);
        }
    }

    private onFluxDispatch(payload: IFluxPayload) {
        if (!payload.id || payload.id === this.props.propertyName ||
            (Array.isArray(this.props.dependsOn) && this.props.dependsOn.filter(x => x === payload.id))) {
                this.validateState(this.props);
        }
    }

    protected validateState(props:IUserInputElementProperties) {
        const value = this.getValue(props);
        if (value !== this.state.value) {
            this.setState({ value: value, isValid: this.validate(props, value) } as TS);
        }
    }

    private fireOnChanged(value: any) {
        if (typeof this.props.onChanged == "function") {
            this.props.onChanged(value);
        }

        if (this.props.flux && typeof this.props.flux.dispatch == "function") {
            this.props.flux.dispatch({sender:this, id: this.props.propertyName, value: value });
        }
    }

    protected validate(props:IUserInputElementProperties, value: any):boolean {
        return true;
    }

    private getValue(props?: IUserInputElementProperties): any {
        if (!props) {
            props = this.props;
        }
        if (props.data && props.propertyName) {
            return props.data[props.propertyName];
        }

        return this.state ? this.state.value : null;
    }

    protected setValue(value:any) {
        if (this.props.data && this.props.propertyName) {
            this.props.data[this.props.propertyName] = value;
        }
    }
}