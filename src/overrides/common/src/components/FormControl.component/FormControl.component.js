import React, {
    forwardRef,
    useState,
    useRef,
    useImperativeHandle,
    useCallback,
    useMemo
} from 'react';
import classnames from 'classnames';

import {FormInputComponent} from '@luft/common/src/components/FormInput.component';
import {PasswordInputComponent} from '@luft/common/src/components/PasswordInput.component';
import {DatepickerComponentLoadable as DatepickerComponent} from '@luft/common/src/components/Datepicker.component';
import {FormLabelComponent} from '@luft/common/src/components/FormControl.component/FormLabel.component';

const INPUT_MAP = {
    password: PasswordInputComponent,
    datepicker: DatepickerComponent,
    default: FormInputComponent
};

type Props = {
    /**
     * Prop, that identifies component, used as component wrap element
     */
    as?: React.Component,
    /**
     * Prop, that identifies component, used as input component
     */
    inputAs?: React.Component,
    /**
     * Input type
     */
    type?: 'text' | 'number' | 'email' | 'password' | 'datepicker',
    /**
     * Input variant
     */
    variant?: 'primary' | 'secondary',
    /**
     * Input id, used to associate input wth label
     */
    controlId?: string,
    /**
     * Input label
     */
    label?: string,
    /**
     * Input value
     */
    value?: any,
    /**
     * Input default value, can be changed when input is uncontrolled
     */
    defaultValue?: string,
    /**
     * If should display label as active
     */
    isLabelActive?: boolean,
    /**
     * if Input is valid
     */
    isInputValid?: boolean,
    /**
     * display Input as correct explicitly
     */
    displayIsValid?: boolean,
    /**
     * If input has an error
     */
    error?: boolean,
    /**
     * If input is disabled
     */
    disabled?: boolean,
    /**
     * Callback fired, when input value has changes
     */
    onChange?: (React.SyntheticEvent) => void,
    /**
     * Callback, fired, when input has gone blur
     */
    onBlur?: (React.SyntheticEvent) => void,
    /**
     * custom className
     */
    className?: string
};

/**
 * Tracks the value and validation status of an individual form control.
 */
export const FormControlComponent = forwardRef((
    {
        as: Component = 'div',
        inputAs,
        type = 'text',
        variant = 'secondary',
        controlId,
        label,
        value,
        defaultValue,
        isLabelActive = false,
        isInputValid = false,
        displayIsValid = true,
        error,
        disabled,
        onChange,
        onBlur,
        className,
        ...other
    }: Props, forwardedRef) => {
    const ref = useRef();
    const callBackRef = useRef();
    useImperativeHandle(forwardedRef, () => ref.current);

    const [isActive, setIsActive] = useState(!!defaultValue || !!value);
    const [isTouched, setIsTouched] = useState(false);

    const InputComponent = useMemo(() => INPUT_MAP[type] || INPUT_MAP.default, [type]);

    const labelClassNames = classnames('form-control-label-transform', {
        'active-label': isLabelActive || isActive,
        error,
        disabled
    });

    const formControlClassNames = classnames(
        'form-control-component',
        `form-control-component-${variant}`,
        {[`form-control-component-${type}`]: type},
        {'form-control-component-error': error},
        {'form-control-component-active-label': isLabelActive || isActive},
        className
    );

    const validationClassNames = classnames([
        {'input-component-error': error},
        {'form-control-component-input-valid': !error && displayIsValid && !disabled && (isInputValid || isTouched)}
    ]);

    const handleOnChange = useCallback((e, ...args) => {
        const isSelect = e.target.tagName.toLowerCase() === 'select';
        const isSelectActive = isSelect && !!e.target.options[e.target.selectedIndex]?.text;

        setIsActive(isSelectActive || !!e.target.value);
        if (onChange) {
            onChange(e, ...args);
        }
    }, [setIsActive, onChange]);

    const handleOnBlur = useCallback((e, ...args) => {
        setIsTouched(!!e.target.value);
        if (onBlur) {
            onBlur(e, ...args);
        }
    }, [setIsTouched, onBlur]);

    const clearState = useCallback(() => {
        setIsActive(false);
        setIsTouched(false);
    }, [setIsActive, setIsTouched]);

    const setInputRef = useCallback((input) => {
        ref.current = input;
        if (!input?.form) return;

        const formElement = input.form;
        formElement.removeEventListener('reset', callBackRef.current);
        formElement.addEventListener('reset', clearState);
        callBackRef.current = clearState;
    }, [clearState]);

    return (
        <Component className={formControlClassNames}>
            {label && (
                <FormLabelComponent className={labelClassNames}
                                    htmlFor={controlId}
                                    id={controlId ? `${controlId}-label` : undefined}>
                    {label}
                </FormLabelComponent>
            )}
            <InputComponent {...other}
                            as={inputAs}
                            type={type}
                            className={validationClassNames}
                            ref={setInputRef}
                            value={value}
                            defaultValue={defaultValue}
                            controlId={controlId}
                            disabled={disabled}
                            onChange={handleOnChange}
                            onBlur={handleOnBlur}/>
        </Component>
    );
});

FormControlComponent.displayName = 'FormControlComponent';
