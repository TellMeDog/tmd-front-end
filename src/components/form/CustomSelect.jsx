import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomSelect.module.css';

const normalize = (text) =>
  String(text ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '');

export default function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = '선택해 주세요',
  searchPlaceholder = '검색해 주세요',
  emptyMessage = '검색 결과가 없습니다.',
  searchable = false,
  placement = 'bottom',
  id,
  className = '',
  disabled = false,
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuRect, setMenuRect] = useState(null);
  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!searchable || !normalizedQuery) return options;
    return options.filter((option) =>
      normalize(`${option.label} ${option.searchText ?? ''}`).includes(normalizedQuery),
    );
  }, [options, query, searchable]);

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  // 옵션 목록을 portal로 body에 그려서, 지도 바텀시트 등 topBar보다 높은 z-index를 가진
  // 형제 요소에 옵션 목록이 가려지지 않도록 함
  useEffect(() => {
    if (!open) return undefined;

    const updateMenuRect = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (rect) setMenuRect(rect);
    };

    updateMenuRect();
    window.addEventListener('scroll', updateMenuRect, true);
    window.addEventListener('resize', updateMenuRect);
    return () => {
      window.removeEventListener('scroll', updateMenuRect, true);
      window.removeEventListener('resize', updateMenuRect);
    };
  }, [open]);

  const openMenu = () => {
    if (disabled || options.length === 0) return;
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setQuery('');
    setOpen(true);
  };

  const selectOption = (option) => {
    onChange(option.value);
    closeMenu();
  };

  const handleKeyDown = (event) => {
    if (disabled || options.length === 0) return;

    if (event.key === 'Escape') {
      closeMenu();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      if (visibleOptions.length === 0) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(
        (current) => (current + direction + visibleOptions.length) % visibleOptions.length,
      );
      return;
    }
    if (event.key === 'Enter' && open && visibleOptions[activeIndex]) {
      event.preventDefault();
      selectOption(visibleOptions[activeIndex]);
    }
  };

  const comboboxProps = {
    role: 'combobox',
    'aria-label': ariaLabel,
    'aria-expanded': open,
    'aria-controls': listboxId,
    'aria-activedescendant':
      open && visibleOptions[activeIndex] ? `${listboxId}-${activeIndex}` : undefined,
  };

  return (
    <div ref={rootRef} className={`${styles.select} ${className}`}>
      {searchable ? (
        <div className={`${styles.trigger} ${styles.searchTrigger} ${open ? styles.open : ''}`}>
          <input
            {...comboboxProps}
            id={id}
            className={styles.searchInput}
            autoComplete="off"
            value={open ? query : (selectedOption?.label ?? '')}
            placeholder={open ? searchPlaceholder : placeholder}
            disabled={disabled}
            onFocus={() => {
              if (!open) openMenu();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              if (!open) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.toggle}
            type="button"
            aria-label={`${ariaLabel} 목록 ${open ? '닫기' : '열기'}`}
            disabled={disabled}
            onClick={() => (open ? closeMenu() : openMenu())}
          >
            <ChevronDown aria-hidden="true" size={18} />
          </button>
        </div>
      ) : (
        <button
          {...comboboxProps}
          id={id}
          className={`${styles.trigger} ${open ? styles.open : ''}`}
          type="button"
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedOption ? '' : styles.placeholder}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown aria-hidden="true" size={18} />
        </button>
      )}
      {open &&
        menuRect &&
        createPortal(
          <ul
            id={listboxId}
            ref={menuRef}
            className={styles.options}
            role="listbox"
            style={{
              position: 'fixed',
              left: menuRect.left,
              width: menuRect.width,
              ...(placement === 'top'
                ? { bottom: window.innerHeight - menuRect.top + 8 }
                : { top: menuRect.bottom + 8 }),
            }}
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option, index) => {
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
                      <span className={styles.optionText}>
                        <span>{option.label}</span>
                        {option.description && <small>{option.description}</small>}
                      </span>
                      {selected && <Check aria-hidden="true" size={17} />}
                    </button>
                  </li>
                );
              })
            ) : (
              <li className={styles.empty}>{emptyMessage}</li>
            )}
          </ul>,
          document.body,
        )}
    </div>
  );
}
