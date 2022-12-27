import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import { Check } from "react-feather";

import styles from "./Checkbox.module.scss";

function Checkbox(props) {
    const [checked, setChecked] = useState(
        props.value || props.default || false,
    );

    useEffect(() => {
        if (typeof props.value !== "boolean") return;
        setChecked(props.value);
    }, [props.value]);

    const onCheckboxClick = () => {
        if (props.onChange) props.onChange(!checked);
        if (typeof props.value === "boolean") return;
        setChecked(!checked);
    };

    return (
        <div
            className={`${styles.container} ${
                props.className ? props.className : ""
            }`}
        >
            <div onClick={onCheckboxClick} className={styles.checkboxContainer}>
                <button
                    disabled={props.disabled}
                    type="button"
                    className={`${styles.checkbox} ${
                        checked ? styles.checked : ""
                    } ${props.radio ? styles.radio : ""}`}
                >
                    {props.radio ? (
                        <span
                            className={
                                checked ? styles.visibleDot : styles.hidden
                            }
                        />
                    ) : (
                        <Check className={`${checked ? styles.active : styles.checkIcon}`}></Check>
                    )}
                </button>
            </div>
            {props.text && (
                <span
                    onClick={() =>
                        props.enableTextClick ? onCheckboxClick() : ""
                    }
                    style={{
                        cursor: props.enableTextClick ? "pointer" : "default",
                    }}
                >
                    {props.text}
                </span>
            )}
            {props.children}
        </div>
    );
}

Checkbox.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    default: PropTypes.bool,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    children: PropTypes.any,
    radio: PropTypes.bool,
    enableTextClick: PropTypes.bool,
};

export default Checkbox;
