import * as React from 'react';
import {Container} from "react-bootstrap";
import {
    BrowserRouter, Route, Switch
} from "react-router-dom";
import { VariantStore } from 'src/store/VariantStore';

import Footer from "../components/Footer";
import Header from "../components/Header";
import GeneFrequencyStore from "../store/GeneFrequencyStore";
import {getPenetranceLevel} from "../util/PenetranceUtils";
import {getQueryParamAsArray, SearchParam} from "../util/RouterUtils";
import About from "./About";
import Download from "./Download";
import Explore from "./Explore";
import Gene from "./Gene";
import Home from "./Home";
import Variant from './Variant';

class Main extends React.Component<{}>
{
    private frequencyStore: GeneFrequencyStore = new GeneFrequencyStore();

    public render()
    {
        const GenePage = (props: any) => (
            <Gene
                hugoSymbol={props.match.params.hugoSymbol}
                cancerTypes={getQueryParamAsArray(props.location, SearchParam.CANCER_TYPE)}
            />
        );

        const HomePage = (routerProps: any) => (
            <Home
                frequencyStore={this.frequencyStore}
                history={routerProps.history}
            />
        );

        const ExplorePage = (props: any) => (
            <Explore
                frequencyStore={this.frequencyStore}
                penetrance={getPenetranceLevel(props.match.params.penetrance)}
            />
        );

        const VariantPage = (props: any) => (
            <Variant
                variant={props.match.params.variant}
                store={
                    new VariantStore(
                        props.match.params.variant,
                        props.location.search
                    )
                }
            />
        );

        return (
            <BrowserRouter>
                <div className="Main">
                    <Header />
                    <Container
                        fluid={true}
                        style={{
                            paddingTop: 20,
                            paddingBottom: 100,
                            color: "#2c3e50"
                        }}
                    >
                        <Switch>
                            <Route exact={true} path="/" component={HomePage}/>
                            <Route exact={true} path="/explore" component={ExplorePage}/>
                            <Route exact={true} path="/explore/:penetrance" component={ExplorePage}/>
                            <Route exact={true} path="/gene/:hugoSymbol" component={GenePage} />
                            <Route exact={true} path="/about" component={About}/>
                            <Route exact={true} path="/download" component={Download}/>
                            <Route
                                exact={true}
                                path="/variant/:variant"
                                component={VariantPage}
                            />
                        </Switch>
                    </Container>
                    <Footer />
                </div>
            </BrowserRouter>
        );
    }
}

export default Main;