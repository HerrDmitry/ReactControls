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
    placeholder?: string;

    onChange?: (newValue: any) => boolean;
    onChanged?: (value: any) => void;

    validation?:IValidationParams;
}

export interface IUserInputElementState extends IElementState {
    value: any;
    isValid:boolean;
}

export interface IValidationResult {
    readonly isValid: boolean;
    readonly canUpdate?: boolean;
}
export interface IValidationParams {
    isRequired?: boolean;
    isForced?: boolean;
    minValue?: string | number;
    maxValue?: string | number;
    errorClassName?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (newValue: any, dataSource?: any, propertyName?:string) => IValidationResult;
}

export abstract class UserInputHtmlElement<TP extends IUserInputElementProperties, TS extends IUserInputElementState> extends HtmlElement<TP, TS> {
    constructor(props: TP) {
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

            if (typeof this.props.onChange == "function") {
                if (!this.props.onChange(newValue)) {
                    return;
                }
            }

            this.validateAndUpdate(this.props, newValue);
        }
    }

    private onFluxDispatch(payload: IFluxPayload) {
        if (payload.sender != this &&
        (!payload.id || payload.id === this.props.propertyName ||
            (Array.isArray(this.props.dependsOn) && this.props.dependsOn.filter(x => x === payload.id)))) {
            this.validateState(this.props);
        }
    }

    private validateAndUpdate(props: TP, newValue: any) {
        const validationResult = this.validate(props, newValue);
        let isValid = validationResult.isValid;
        if (!validationResult.canUpdate && newValue !== this.state.value) {
            newValue = this.getValue(props);
            const oldValidation = this.validate(props, newValue);
            isValid = oldValidation.isValid;
        } else {
            this.setValue(newValue);
            this.fireOnChanged(newValue);
        }

        if (this.state.value !== newValue || this.state.isValid !== isValid) {
            this.setState({ value: newValue, isValid: isValid } as TS);
        }
    }

    protected validateState(props: TP) {
        if (props.data && props.propertyName) {
            const value = this.getValue(props);
            this.validateAndUpdate(props, value);
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

    protected validate(props: TP, value: any): IValidationResult {
        if (props.validation && typeof props.validation.custom == "function") {
            return props.validation.custom(value, this.props.data, this.props.propertyName);
        }

        let isValid = true;
        let canUpdate = true;

        if (props && props.validation) {
            if (props.validation.isRequired) {
                isValid = value !== "" && value != undefined && value != null;
            }

            const maxLength = this.getNumber(props.validation.maxLength);
            if (isValid && maxLength > 0 && value.toString().length > maxLength) {
                isValid = false;
                canUpdate = false;
            }

            const minLength = this.getNumber(props.validation.minLength);
            if (isValid && minLength > 0 && value.toString().length < minLength) {
                isValid = false;
            }
        }

        return { canUpdate: canUpdate, isValid: isValid } as IValidationResult;
    }

    private getNumber(value?: number) {
        if (value != undefined && value != null && value > 0) {
            return value;
        }

        return 0;
    }

    private getValue(props?: TP): any {
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
            return true;
        }

        return false;
    }
}