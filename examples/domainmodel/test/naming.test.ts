/**
 * MIT License
 */

import { AstNode, LangiumDocument, EmptyFileSystem, AstNodeDescription } from 'langium';
import { parseDocument } from 'langium/test';
import { createDomainModelServices } from '../src/language-server/domain-model-module';

const services = createDomainModelServices(EmptyFileSystem).domainmodel;

describe('Small Java Index: Qualified Names', () => {

    let testDoc: LangiumDocument<AstNode>;
    let exports: AstNodeDescription[];

    beforeAll(async () => {
        const text=`
        entity E1 {
            name: String
        }

        package foo.bar {
            datatype Complex

            entity E2 extends E1 {
                next: E2
                other: baz.E3
                nested: baz.nested.E5
                time: big.Int
            }
        }

        package baz {
            entity E3 {
                that: E4
                other: foo.bar.E2
                nested: nested.E5
            }

            entity E4 {
            }

            package nested {
                entity E5 {
                    ref: E3
                }
            }
        }`;

        testDoc = await parseDocument(services, text);
        exports = await services.references.ScopeComputation.computeExports(testDoc);
    });

    it('Trying to get FQN Info', () => {
        console.log(exports);
        expect('A').toBe('C');
    });
});
