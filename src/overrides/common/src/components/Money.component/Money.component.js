import {useIntl} from 'react-intl';

import type {Money} from '@luft/types';

type Props = {
    /**
     * Money Type, should contain any value as number and optional currency
     */
    money: Money,
    /**
     * formatNumber react-intl options
     */
    options?: Object,
    /**
     * if value should be converted to negative
     */
    isNegative?: Boolean,
    /**
     * custom formatting used for this component. Defaults to 'money'.
     * This allows to pass named formats for number formatter in Intl Provder
     * like this:
     *
     * {
     *     formats: {
     *         number: {
     *             money: {
     *                 minimumFractionDigits: 0,
     *                 maximumFractionDigits: 0
     *             }
     *         }
     *     }
     * }
     *
     * This will remove fraction digits from money component.
     *
     */
    format?: String,
    /**
     * Money.value multiplier
     */
    qty?: Number
}

export function MoneyComponent(props: Props) {
    const {
        money,
        options = {},
        isNegative = false,
        format = 'money',
        qty,
    } = props;

    const {formatNumber, locale} = useIntl();

    if (!money) {
        return null;
    }

    const {currency} = money;
    let {value} = money;

    if (isNegative) {
        value *= -1;
    }

    if (qty > 0) {
        value *= qty;
    }

    const formattedPrice = formatNumber(value, {
        style: 'currency',
        currency,
        format,
        ...options
    });

    /**
     * Replace currency symbol for Store view, fix cross-browser compatibility
     */

    switch (locale) {
        case 'en-US':
            return formattedPrice.replace(/PKR/, 'Rs');
        case 'en-AE':
            return formattedPrice.replace(/AWG/, 'AED');
        default:
            return formattedPrice;
    }
}
