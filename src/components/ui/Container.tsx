import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

//Interface
interface Props {
    children?: ReactNode;
    className?: string;
}

const Container = ({ children, className }: Props) => {
    return (
        <div className={twMerge("xl:container xl:mx-auto xl:px-[130px] md:px-[60px]", className)}>
            {children}
        </div>
    );
};

export default Container;