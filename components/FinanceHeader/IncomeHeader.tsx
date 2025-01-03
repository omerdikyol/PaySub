import React from 'react';
import { BaseHeader, BaseHeaderProps } from './BaseHeader';

export const IncomeHeader = (props: Omit<BaseHeaderProps, 'title'>) => {
  return <BaseHeader {...props} title="Income" />;
};