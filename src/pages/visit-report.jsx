import { useState } from 'react';
import { Page, Navbar, Block, List, ListItem, Button, f7 } from 'framework7-react';

const options = [
  { id: 'entered', label: '입장했어요', icon: 'checkmark_alt_circle_fill', color: 'green' },
  { id: 'different', label: '조건이 달랐어요', icon: 'exclamationmark_triangle_fill', color: 'yellow' },
  { id: 'rejected', label: '입장을 거부당했어요', icon: 'xmark_circle_fill', color: 'red' },
];

export default function VisitReportPage() {
  const [selected, setSelected] = useState(null);

  const submit = () => {
    if (!selected) {
      f7.dialog.alert('결과를 선택해 주세요.');
      return;
    }
    // TODO: API 연동 - 방문 제보 등록
    f7.dialog.alert('제보가 등록되었습니다. 감사합니다!', () => f7.views.main.router.back());
  };

  return (
    <Page name="visit-report">
      <Navbar title="방문 결과 알려주세요" backLink="뒤로" />

      <List strong insetIos dividersIos>
        {options.map((opt) => (
          <ListItem
            key={opt.id}
            link
            title={opt.label}
            after=">"
            className={selected === opt.id ? 'active-state' : ''}
            onClick={() => setSelected(opt.id)}
          />
        ))}
      </List>

      <Block>
        <Button large fill round onClick={submit}>
          제보 등록
        </Button>
      </Block>
    </Page>
  );
}
