import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Col, Row } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import BasicInfo from '../components/variantPage/BasicInfo';
import FunctionalGroups from '../components/variantPage/FunctionalGroups';
import { VariantStore } from '../store/VariantStore';
// import { getTranscriptConsequenceSummary } from '../util/AnnotationSummaryUtil';
import { variantToMutation } from '../util/VariantUtils';
import './Variant.css';

interface IVariantProps {
    variant: string;
    store: VariantStore;
    mainLoadingIndicator?: JSX.Element;
}

const win: any = window as any;

@observer
class Variant extends React.Component<IVariantProps> {
    constructor(props: IVariantProps) {
        super(props);
        win.props = props;
    }

    public render(): React.ReactNode {
        // tslint:disable-next-line:no-console
        console.log("here i am");
        
        return this.isLoading 
            ? (this.loadingIndicator)
            : (<div className={'page-body variant-page'}>
                    <Row>
                        <Col>
                            <BasicInfo
                                annotation={
                                    this.props.store
                                        .annotationSummary
                                }
                                mutation={
                                    variantToMutation(
                                        this.props.store
                                            .annotationSummary
                                    )[0]
                                }
                                variant={this.props.variant}
                                oncokbGenesMap={
                                    this.props.store.oncokbGenesMap
                                        .result
                                }
                                oncokb={this.oncokb}
                                selectedTranscript={
                                    this.props.store
                                        .selectedTranscript
                                }
                                isCanonicalTranscriptSelected={
                                    this
                                        .isCanonicalTranscriptSelected
                                }
                                allValidTranscripts={
                                    this.allValidTranscripts
                                }
                                onTranscriptSelect={this.onTranscriptSelect}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <FunctionalGroups
                                myVariantInfo={this.myVariantInfo}
                                annotationInternal={
                                    this.props.store.annotationSummary
                                }
                                variantAnnotation={this.variantAnnotation}
                                oncokb={this.oncokb}
                                isCanonicalTranscriptSelected={
                                    this.isCanonicalTranscriptSelected!
                                }
                            />
                        </Col>
                    </Row>
                        {!this.isCanonicalTranscriptSelected && (
                            <div>
                                * This resource uses a transcript different from
                                the displayed one, but the genomic change is the
                                same.
                            </div>
                        )}
                </div>
        )};

    // @computed
    // private get variant() {
    //     return this.props.variant;
    // }

    @computed
    private get myVariantInfo() {
        return this.props.store.annotation.result &&
            this.props.store.annotation.result.my_variant_info
            ? this.props.store.annotation.result.my_variant_info.annotation
            : undefined;
    }

    @computed
    private get oncokb() {
        return this.props.store.oncokbData.result;
    }

    @computed
    private get variantAnnotation() {
        return this.props.store.annotation.result
            ? this.props.store.annotation.result
            : undefined;
    }

    @computed
    get isCanonicalTranscriptSelected() {
        if (this.props.store.annotationSummary) {
            // no selection, canonical transcript will be selected as default
            return (
                this.props.store.selectedTranscript === '' ||
                this.props.store.selectedTranscript ===
                    this.props.store.annotationSummary.canonicalTranscriptId
            );
        } else {
            return undefined;
        }
    }

    protected get isLoading() {
        return (
            this.props.store.annotation.isPending ||
            this.props.store.oncokbGenesMap.isPending ||
            this.props.store.isAnnotatedSuccessfully.isPending
        );
    }

    protected get loadingIndicator() {
        return (
            this.props.mainLoadingIndicator || (
                <div className={'loadingIndicator'}>
                    <Spinner
                        fadeIn={'none'}
                        name="ball-scale-multiple"
                        color="aqua"
                    />
                </div>
            )
        );
    }

    @computed get allValidTranscripts() {
        if (
            this.props.store.isAnnotatedSuccessfully.isComplete &&
            this.props.store.isAnnotatedSuccessfully.result === true &&
            this.props.store.getMutationMapperStore &&
            this.props.store.getMutationMapperStore.transcriptsWithAnnotations
                .result &&
            this.props.store.getMutationMapperStore.transcriptsWithAnnotations
                .result.length > 0
        ) {
            return this.props.store.getMutationMapperStore
                .transcriptsWithAnnotations.result;
        }
        return [];
    }

    @action.bound
    private setActiveTranscript(transcriptId: string) {
        // set mutation mapper active transcript
        this.props.store.getMutationMapperStore!.activeTranscript = transcriptId;
        // set variant page active transcript
        this.props.store.selectedTranscript = transcriptId;
        const transcriptIdQuery = '?transcriptId=' + transcriptId;
        win.history.pushState(
            { transcriptId: transcriptIdQuery, title: document.title },
            document.title,
            transcriptIdQuery
        );
    }

    @action.bound
    private onTranscriptSelect(transcriptId: string) {
        this.setActiveTranscript(
            transcriptId
        )
    }

}

export default Variant;
