import { useState } from 'react';
import { Page, Navbar, Block, List, ListItem, Checkbox, Progressbar } from 'framework7-react';

const initialItems = [
  { id: 'leash', label: '목줄', checked: true },
  { id: 'bag', label: '배변 봉투', checked: true },
  { id: 'muzzle', label: '입마개', checked: false, conditional: true },
];

export default function VisitPrepPage() {
  const [items, setItems] = useState(initialItems);
  const doneCount = items.filter((i) => i.checked).length;

  const toggle = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  };

  return (
    <Page name="visit-prep">
      <Navbar title="헛걸음 방지 체크" backLink="뒤로" />

      <Block strong>
        <p className="text-color-green">
          {items.length}개 중 {doneCount}개 완료
        </p>
        <Progressbar progress={(doneCount / items.length) * 100} color="green" />
      </Block>

      <List strong insetIos dividersIos>
        {items.map((item) => (
          <ListItem
            key={item.id}
            checkbox
            checked={item.checked}
            onChange={() => toggle(item.id)}
            title={item.label}
            after={item.conditional ? '조건부' : ''}
          />
        ))}
      </List>

      <Block strongIos outlineIos className="text-color-gray">
        조건부 항목은 장소별 규정을 확인 후 준비해 주세요.
      </Block>
    </Page>
  );
}
