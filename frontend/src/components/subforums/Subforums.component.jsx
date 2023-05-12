import api from "../../utils/api";
import React, {Component} from 'react';
import Subforum from "./Subforum.component";

class Subforums extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            data: null,
        }
    }

    async componentDidMount() {
        try {
            const subforums = await this.fetchSubforums();
            this.setState({
                data: subforums,
            });
        } catch {

        } finally {
            this.setState({
                isLoading: false,
            })
        }
    }

    async fetchSubforums() {
        const {forumId, serverId} = this.props;

        const res = await api.get(`/servers/${serverId}/forums/${forumId}/subforums`);

        if (res.ok) {
            return res.data;
        } else {
            throw new Error('Failed to fetch data');
        }
    }

    render() {
        const {isLoading, data} = this.state;
        if (isLoading === true) {
            return <p>Loading...</p>;
        } else if (data == null) {
            return <p>Failed to load subforums</p>
        }
        return data.reverse().map(subforum =>
            <Subforum key={subforum.id} data={subforum}
                      serverId={this.props.serverId}/>
        );
    }
}

export default Subforums;