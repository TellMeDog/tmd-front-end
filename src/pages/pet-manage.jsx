import { Page, Navbar, List, ListItem } from 'framework7-react';

export default function PetManagePage() {
  return (
    <Page name="pet-manage">
      <Navbar title="반려동물 관리" backLink="뒤로" />
      <List strong insetIos dividersIos mediaList>
        <ListItem title="멍이" subtitle="말티즈 · 3.5kg" after=">" />
        <ListItem link title="+ 반려동물 추가" />
      </List>
    </Page>
  );
}
