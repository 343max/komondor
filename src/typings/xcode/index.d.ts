export declare module 'xcode' {
  type BuildPhaseType =
    | 'PBXCopyFilesBuildPhase'
    | 'PBXResourcesBuildPhase'
    | 'PBXSourcesBuildPhase'
    | 'PBXFrameworksBuildPhase'
    | 'PBXShellScriptBuildPhase';

  type ProductType =
    | 'com.apple.product-type.application'
    | 'com.apple.product-type.app-extension'
    | 'com.apple.product-type.bundle'
    | 'com.apple.product-type.tool'
    | 'com.apple.product-type.library.dynamic'
    | 'com.apple.product-type.framework'
    | 'com.apple.product-type.library.static'
    | 'com.apple.product-type.bundle.unit-test'
    | 'com.apple.product-type.application.watchapp'
    | 'com.apple.product-type.application.watchapp2'
    | 'com.apple.product-type.watchkit-extension'
    | 'com.apple.product-type.watchkit2-extension';

  type ShellScriptBuildPhaseOptions = {
    inputPaths: string[] | undefined;
    outputPaths: string[] | undefined;
    shellPath: string;
    shellScript: string;
  };

  type AddBuildPhaseResult = {
    uuid: string;
    name: string;
    inputPaths: string[];
    outputPaths: string[];
    shellPath: string;
    shellScript: string;
  };

  type NativeTargetSection = {
    uuid: string;
    target: {
      isa: 'PBXNativeTarget';
      name: string;
      productName: string;
      productReference: any;
      productType: string;
      buildConfigurationList: string;
      buildPhases: { comment: string; value: string }[];
      buildRules: any[];
      dependencies: any[];
    };
  };

  interface PbxProject {
    parseSync();
    writeSync();
    addBuildPhase(
      filePathsArray: string[],
      buildPhaseType: 'PBXShellScriptBuildPhase',
      comment: string,
      target: string | undefined,
      optionsOrFolderType: ShellScriptBuildPhaseOptions
    ): AddBuildPhaseResult;

    pbxNativeTargetSection(): Record<string, NativeTargetSection>;
    getTarget(productType: ProductType): NativeTargetSection | null;
  }

  function project(filename: string): PbxProject;
}
