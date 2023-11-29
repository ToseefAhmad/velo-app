import React from 'react';
import {noop} from 'lodash';
import classnames from 'classnames';

import type {VariationValue} from '@luft/types';

type VariationAttributeValue = {
    id: string,
    name: string,
    value?: string,
    position: number
};

type VariationAttribute = {
    options_count: number,
    values: VariationAttributeValue[]
};

type Props = {
    variationAttribute: VariationAttribute,
    variationValue: VariationValue,
    disabledValuesIds: string[],
    onValueSelect?: (variationAttributeValue: VariationAttributeValue) => any
};

const isValueSelected = (variationValue, attrValue) => variationValue && variationValue.value === attrValue.id;

const createIndicatorList = (amount: number, filledAmount: number): boolean[] =>
    // eslint-disable-next-line implicit-arrow-linebreak
    [...Array(filledAmount).fill(true), ...Array(amount - filledAmount).fill(false)];

export function VariationAttributeAdaptiveComponent(props: Props) {
    const {
        variationAttribute,
        variationValue,
        disabledValuesIds,
        onValueSelect = noop
    } = props;

    if (!variationAttribute) {
        return null;
    }

    const {options_count} = variationAttribute;

    return (
        <div className="variation-attribute-adaptive-component">
            {variationAttribute.values.map((variationAttributeValue) => {
                const {id, name, position} = variationAttributeValue;

                const isDisabled = disabledValuesIds.includes(id);
                const isSelected = isValueSelected(variationValue, variationAttributeValue);
                const indicatorList = createIndicatorList(options_count, position);

                const activeClassNames = classnames('variation-attribute-adaptive-component-value', {
                    'variation-attribute-adaptive-component-value-active': isSelected,
                    'variation-attribute-adaptive-component-value-disabled': isDisabled
                });

                return (
                    <button className={activeClassNames}
                            type="button"
                            onClick={() => onValueSelect(variationAttributeValue)}
                            key={id}
                            disabled={isDisabled}
                            title={name}>
                        <span className="variation-attribute-adaptive-component-name">
                            {name}
                        </span>

                        <div className="variation-attribute-adaptive-component-indicators">
                            {indicatorList.map((isFilled, i) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <div key={i}
                                     className={classnames('variation-attribute-adaptive-component-indicator', {
                                        'variation-attribute-adaptive-component-indicator-filled': isFilled
                                     })}/>
                            ))}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
