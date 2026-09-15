import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './CustomSelect.module.css';

export default function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = '선택해 주세요',
  className = '',
  disabled = false,
}) {
  const rootRef = useRef(null);
  const listboxId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return undefined;

    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  const openMenu = () => {
    if (disabled || options.length === 0) return;
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const selectOption = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (disabled || options.length === 0) return;

    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }
    if (event.key === 'Enter' && open) {
      event.preventDefault();
      selectOption(options[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className={`${styles.select} ${className}`}>
      <button
        className={`${styles.trigger} ${open ? styles.open : ''}`}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? `${listboxId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? '' : styles.placeholder}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>
      {open && (
        <ul id={listboxId} className={styles.options} role="listbox">
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li
                id={`${listboxId}-${index}`}
                key={option.value}
                role="option"
                aria-selected={selected}
              >
                <button
                  className={`${styles.option} ${index === activeIndex ? styles.active : ''}`}
                  type="button"
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  <span>{option.label}</span>
                  {selected && <Check aria-hidden="true" size={17} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
