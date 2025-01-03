import React from 'react';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';

export const ExpenseHeader = (props: Omit<BaseHeaderProps, 'title'>) => {
  return <BaseHeader {...props} title="Expenses" />;
};