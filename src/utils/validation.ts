namespace App {
    //?Validation Logic
    export interface Validatable {
        value: string | number;
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
    }

    export function validate(validatableInput: Validatable): boolean {
        let isValid = true;

        // Validate Required
        if (validatableInput.required) {
            isValid =
                isValid &&
                validatableInput.value.toString().trim().length !== 0;
        }

        //Validate Min Length
        if (
            validatableInput.minLength != null &&
            typeof validatableInput.value === "string"
        ) {
            isValid =
                isValid &&
                validatableInput.value.length >= validatableInput.minLength;
        }

        //Validate Max Length
        if (
            validatableInput.maxLength != null &&
            typeof validatableInput.value === "string"
        ) {
            isValid =
                isValid &&
                validatableInput.value.length <= validatableInput.maxLength;
        }

        //Validate Max
        if (
            validatableInput.max != null &&
            typeof validatableInput.value === "number"
        ) {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }

        //Validate Min
        if (
            validatableInput.min != null &&
            typeof validatableInput.value === "number"
        ) {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }

        return isValid;
    }
}
