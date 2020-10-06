import {
    remoteData,
} from 'cbioportal-frontend-commons';
import { VariantAnnotation } from 'genome-nexus-ts-api-client';
import _ from 'lodash';
import { computed, observable } from 'mobx';
import MobxPromise from 'mobxpromise';
import { CuratedGene, IndicatorQueryResp } from 'oncokb-ts-api-client';
import qs from 'qs';
import { DataFilterType, initDefaultMutationMapperStore } from 'react-mutation-mapper';
import { getTranscriptConsequenceSummary } from 'src/util/AnnotationSummaryUtil';
// import {
//     DataFilterType,
//     initDefaultMutationMapperStore,
// } from 'react-mutation-mapper';
import { genomeNexusDomain, getGenomeNexusClient, getOncokbClient } from 'src/util/ApiClientUtils';
import { ANNOTATION_QUERY_FIELDS } from 'src/util/Constants';
import { variantToMutation } from 'src/util/VariantUtils';
// import { getTranscriptConsequenceSummary } from '../util/AnnotationSummaryUtil';
// import { variantToMutation } from '../util/variantUtils';
// import { genomeNexusApiRoot } from './genomeNexusClientInstance';

export interface IVariantStoreConfig {
    variant: string;
}
export class VariantStore {
    public query: any;
    public genomeNexusClient = getGenomeNexusClient();
    public oncokbClient = getOncokbClient();

    @observable public variant: string = '';
    @observable public selectedTranscript: string = '';

    public readonly annotation = remoteData<VariantAnnotation>({
        invoke: async () => {
            return await this.genomeNexusClient.fetchVariantAnnotationGET({
                variant: this.variant,
                isoformOverrideSource: 'uniprot',
                fields: ANNOTATION_QUERY_FIELDS,
            });
        },
        onError: (err: Error) => {
            // fail silently
        },
    });


    public readonly oncokbData: MobxPromise<IndicatorQueryResp> = remoteData({
        invoke: async () => {
            return await this.oncokbClient.annotateMutationsByHGVSgGetUsingGET_1({
                hgvsg: this.variant,
            });
        },
        onError: () => {
            // fail silently, leave the error handling responsibility to the data consumer
        },
    });

    public readonly oncokbGenes = remoteData<CuratedGene[]>({
        await: () => [],
        invoke: async () => {
            return this.oncokbClient.utilsAllCuratedGenesGetUsingGET_1({});
        },
        // onError: error => {},
        default: [],
    });

    public readonly oncokbGenesMap = remoteData<{ [hugoSymbol: string]: CuratedGene }>({
        await: () => [this.oncokbGenes],
        invoke: async () => {
            return Promise.resolve(
                _.keyBy(this.oncokbGenes.result, gene => gene.hugoSymbol)
            );
        },
        // onError: error => {},
        default: {},
    });

    public readonly isAnnotatedSuccessfully = remoteData<boolean>({
        await: () => [this.annotation],
        invoke: () => {
            // TODO use successfully_annotated instead of checking genomicLocation
            return Promise.resolve(
                this.annotation.result &&
                    this.annotation.result.annotation_summary.genomicLocation
                        .chromosome &&
                    this.annotation.result.annotation_summary.genomicLocation
                        .start &&
                    this.annotation.result.annotation_summary.genomicLocation
                        .end &&
                    this.annotation.result.annotation_summary.genomicLocation
                        .referenceAllele &&
                    this.annotation.result.annotation_summary.genomicLocation
                        .variantAllele
                    ? true
                    : false
            );
        },
    });

    @computed
    get getMutationMapperStore() {
        const mutation = variantToMutation(this.annotationSummary);
        if (
            mutation[0] &&
            mutation[0].gene &&
            mutation[0].gene.hugoGeneSymbol.length !== 0
        ) {
            const store = initDefaultMutationMapperStore({
                genomeNexusUrl: genomeNexusDomain,
                data: mutation,
                hugoSymbol: getTranscriptConsequenceSummary(
                    this.annotationSummary
                ).hugoGeneSymbol,
                oncoKbUrl: 'https://www.cbioportal.org/proxy/oncokb',
                // select the lollipop by default
                selectionFilters: [
                    {
                        type: DataFilterType.POSITION,
                        values: [mutation[0].proteinPosStart],
                    },
                ],
            });
            return store;
        }
        return undefined;
    }

    constructor(public variantId: string, public queryString: string) {
        this.variant = variantId;
        this.query = qs.parse(this.queryString, { ignoreQueryPrefix: true });
        this.parseUrl();
        // set activeTranscript when MutationMapperStore is created
    }

    private parseUrl() {
        if (this.query.transcriptId) {
            this.selectedTranscript = this.query.transcriptId;
        }
    }

    @computed
    get annotationSummary() {
        return this.annotation.result
            ? this.annotation.result.annotation_summary
            : undefined;
    }

    
}
