import React from 'react';
import Page from "../../components/page/Page.component";
import Container from "../../components/container/Container.component";
import {Tab, TabList, TabPanel, useTabState} from "reakit/Tab";
import UserServerAdminBoard from "../../components/userServerAdminBoard/userServerAdminBoard.component";
import UserForumAdminBoard from "../../components/userForumAdminBoard/UserForumAdminBoard.component";
import ServerAdminBoard from "../../components/serverAdminBoard/ServerAdminBoard.component";

function AdminPage() {

  const tab = useTabState({ selectedId: 'admin' });

  return (
    <Page>
      <Container>
        <TabList {...tab} aria-label={'Admin Tabs'}>
          <Tab {...tab} id={'admin'}>Admin</Tab>
          <Tab {...tab} id={'forums'}>Forums</Tab>
          <Tab {...tab} id={'servers'}>Servers</Tab>
        </TabList>
        <TabPanel {...tab}><UserServerAdminBoard /></TabPanel>
        <TabPanel {...tab}><UserForumAdminBoard /></TabPanel>
        <TabPanel {...tab}><ServerAdminBoard /></TabPanel>
      </Container>
    </Page>
  );
}

AdminPage.propTypes = {};

export default AdminPage;
