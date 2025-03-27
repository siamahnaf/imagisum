import { InputHTMLAttributes, forwardRef } from "react";
import { IconAlertSquareRoundedFilled } from "@tabler/icons-react";

//Interface
interface Props extends InputHTMLAttributes<HTMLInputElement> {
    id: string;
    errorMessage?: string;
    label?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ errorMessage, id, label, ...rest }, ref) => {
    return (
        <div className="relative">
            {label &&
                <label htmlFor={id} className="text-base font-semibold mb-[10px] block">
                    {label}
                </label>
            }
            <input
                id={id}
                ref={ref}
                className={`border border-solid rounded-xl w-full text-base text-black border-[#ccc] placeholder:text-[#ccc] focus:border-accent bg-transparent focus:outline-none py-2.5 px-4`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                list="autocompleteOff"
                aria-autocomplete="none"
                {...rest}
            />
            <p className={`top-full left-0 absolute text-sm text-error mt-1 flex items-center gap-1 transition-all ${errorMessage ? "opacity-100 visible -translate-y-0" : "opacity-0 invisible -translate-y-1"}`}>
                <span className="basis-[15px]">
                    <IconAlertSquareRoundedFilled size={18} />
                </span>
                <span>{errorMessage}</span>
            </p>
        </div>
    );
});

export default Input;

Input.displayName = "Input";