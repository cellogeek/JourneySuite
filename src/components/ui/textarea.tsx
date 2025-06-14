
import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full p-3 bg-white/50 border-2 border-brand-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500',
          'focus:ring-2 focus:ring-brand-sky-500 focus:border-brand-sky-500 transition-all duration-300',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
