import React, {Component} from 'react';
import Dashboard from "../../components/dashboard/Dashboard.component";
import Page from "../../components/page/Page.component";

class Index extends Component {
    render() {
        return (
          <Page>
            <Dashboard/>
          </Page>
        );
    }
}

export default Index;
