/******************************************************************************
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import { AstNode, LangiumDocument, EmptyFileSystem, AstNodeDescription } from 'langium';
import { parseDocument } from 'langium/test';
import { createDomainModelServices } from '../src/language-server/domain-model-module';

const services = createDomainModelServices(EmptyFileSystem).domainmodel;

describe('Domain Model Scope Computation', () => {

    let testDoc: LangiumDocument<AstNode>;
    let exports: AstNodeDescription[];
    let parsedTypes: string;
    let computedNames: string;
    const expectedNames = 'E1, foo.bar.Complex, foo.bar.E2, baz.E3, baz.E4, baz.nested.E5';

    /**
     *  Note: `DomainModelScopeComputation` exports only types (`DataType or `Entity`) with
     *  their qualified names.
     */
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
        parsedTypes = exports.map(e => e.type).join(', ');
        console.log(parsedTypes);
        computedNames = exports.map(e => e.name).join(', ');
    });

    it('Exports Qualified Names', () => {
        expect(computedNames).toBe(expectedNames);
    });
});
