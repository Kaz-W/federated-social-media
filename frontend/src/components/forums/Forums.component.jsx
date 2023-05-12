import React, {Component} from 'react';
import api from "../../utils/api";
import Forum from "./Forum.component";

class Forums extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            loading: true
        }
    }

    async componentDidMount() {
        try {
            let forums = await this.fetchForums();
            this.setState({data: forums});
        } catch {

        } finally {
            this.setState({isLoaded: true});
        }
    }

    async fetchForums() {
        let res = await api.get('/internal/allforums');

        if (res.ok) {
            return res.data;
        } else {
            throw new Error('Failed to fetch data');
        }
    }

    generateForums() {
        const {data, isLoaded} = this.state;
        if (!isLoaded) {
            return <h5>Loading...</h5>;
        } else if (!data) {
            return <h5>Failed to load forums</h5>;
        }
        return data.map(forum => <Forum key={forum._links.self.href} data={forum} />);
    }


    render() {
        return (
            <div>
                <h3>Forums</h3>
                <div>
                    {this.generateForums()}
                </div>
            </div>
        );
    }
}

export default Forums;


