import { TbCheck, TbX } from "react-icons/tb";

interface FieldValidatorProps {
    name: string;
    error?: string;
};

const FieldValidator: React.FC<FieldValidatorProps> = ({ name, error }) => {
    return (
        <div className="flex flex-row items-center justify-between space-x-1">
            <span>{name}</span>
            { error ? <TbX size={16} className="text-red-500"/> : <TbCheck size={16} className="text-green-500"/> }
            { error && <span className="text-red-500">{error}</span> }
        </div>
    );
}

export default FieldValidator;