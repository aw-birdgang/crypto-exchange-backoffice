import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { FormItemProps } from 'antd/es/form';
import { InputProps } from 'antd/es/input';
import { SelectProps } from 'antd/es/select';
import { DatePickerProps } from 'antd/es/date-picker';
import { InputNumberProps } from 'antd/es/input-number';

interface BaseFormFieldProps extends Omit<FormItemProps, 'children'> {
  type?: 'input' | 'password' | 'email' | 'textarea' | 'select' | 'date' | 'number';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

interface InputFormFieldProps extends BaseFormFieldProps {
  type?: 'input' | 'password' | 'email' | 'textarea';
  inputProps?: InputProps;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: 'select';
  selectProps?: SelectProps;
  options: Array<{ label: string; value: any }>;
}

interface DateFormFieldProps extends BaseFormFieldProps {
  type: 'date';
  dateProps?: DatePickerProps;
}

interface NumberFormFieldProps extends BaseFormFieldProps {
  type: 'number';
  numberProps?: InputNumberProps;
}

type FormFieldProps = InputFormFieldProps | SelectFormFieldProps | DateFormFieldProps | NumberFormFieldProps;

export const FormField: React.FC<FormFieldProps> = ({
  type = 'input',
  placeholder,
  disabled = false,
  required = false,
  ...props
}) => {
  const rules = [
    ...(props.rules || []),
    ...(required ? [{ required: true, message: `${props.label} is required` }] : []),
  ];

  const renderInput = () => {
    switch (type) {
      case 'password':
        return <Input.Password placeholder={placeholder} disabled={disabled} {...(props as InputFormFieldProps).inputProps} />;
      case 'email':
        return <Input type="email" placeholder={placeholder} disabled={disabled} {...(props as InputFormFieldProps).inputProps} />;
      case 'textarea':
        return <Input.TextArea placeholder={placeholder} disabled={disabled} />;
      case 'select':
        return (
          <Select
            placeholder={placeholder}
            disabled={disabled}
            options={(props as SelectFormFieldProps).options}
            {...(props as SelectFormFieldProps).selectProps}
          />
        );
      case 'date':
        return <DatePicker placeholder={placeholder} disabled={disabled} {...(props as DateFormFieldProps).dateProps} />;
      case 'number':
        return <InputNumber placeholder={placeholder} disabled={disabled} {...(props as NumberFormFieldProps).numberProps} />;
      default:
        return <Input placeholder={placeholder} disabled={disabled} {...(props as InputFormFieldProps).inputProps} />;
    }
  };

  return (
    <Form.Item {...props} rules={rules}>
      {renderInput()}
    </Form.Item>
  );
};
