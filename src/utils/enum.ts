export enum  ResultStatus {
    Pass = "pass",
    Fail = "fail",
    Skip = "skip",
    Block = "block",
    Unknown = "unknown",
}

export enum UsedBy {
    InterfaceDebug = "interface_debug",
    ScenarioDebug = "scenario_debug",
    DiagnoseDebug = "diagnose_debug",
    CaseDebug = "case_debug",
    AlternativeCaseDebug = "alternative_case_debug",
    MockData = "mock_data",
    MockResp = "mock_resp",

    OpenAPIYaml = "openapi_yaml",
}

export enum DiagnoseInterfaceType {
    Dir = "dir",
    Interface = "interface",
    WebsocketInterface  = "websocket_interface",
    GrpcInterface = "grpc_interface",
}

export enum ProcessorInterfaceSrc {
    Define = "define",
    Case = "case",
    Diagnose = "diagnose",
    Curl = "curl",
    Custom = "custom",
}


export enum VarScope {
    ScopePublic = "public",
    ScopePrivate = "private",
}

export enum WsMsgCategory {
    InProgress = "in_progress",
    End = "end",
    Result = "result",
    Exception       = "exception",
}
export enum WsMsgProgress {
    NotStart = "not_start",
    InProgress = "in_progress",
    End = "end",
}

export enum ProcessorAction {
    ActionEdit = 'action_edit',
    ActionRemove = 'action_remove',
    ActionImportInterface = 'action_import_interface',
    ActionAddProcessor = 'action_add_processor',
    ActionInInterface = 'action_in_interface',
}

export enum ProcessorCategory {
    ProcessorRoot = "processor_root",
    ProcessorThread = "processor_thread",
    ProcessorGroup = "processor_group",
    ProcessorInterface = "processor_interface",
    ProcessorLogic = "processor_logic",
    ProcessorLoop = "processor_loop",
    ProcessorData = "processor_data",
    ProcessorVariable  = "processor_variable",
    ProcessorCookie = "processor_cookie",
    ProcessorExtractor = "processor_extractor",
    ProcessorTimer = "processor_timer",
    ProcessorPrint = "processor_print",
    ProcessorAssertion = "processor_assertion",
    ProcessorCustomCode = "processor_custom_code",

}
export enum ProcessorInterface {
    Interface = "processor_interface_default",
}
export enum ProcessorRoot {
    Root = "processor_root_default",
}
export enum ProcessorThread {
    Thread = "processor_thread_default",
}
export enum ProcessorGroup {
    Group = "processor_group_default",
}
export enum ProcessorTimer {
    Time = "processor_time_default",
}
export enum ProcessorPrint {
    Print = "processor_print_default",
}

export enum ProcessorLogic {
    If = "processor_logic_if",
    Else = "processor_logic_else",
}

export enum ProcessorLoop {
    Time = "processor_loop_time",
    Until = "processor_loop_until",
    In = "processor_loop_in",
    Range = "processor_loop_range",
    Break = "processor_loop_break",
}

export enum ProcessorVariable {
    Set = "processor_variable_set",
    Clear = "processor_variable_clear",
}

export enum ProcessorAssertion {
    Assertion = "processor_assertion_default",
}

export enum ProcessorExtractor {
    Boundary = "processor_extractor_boundary",
    JsonQuery = "processor_extractor_jsonquery",
    HtmlQuery = "processor_extractor_htmlquery",
    XmlQuery = "processor_extractor_xmlquery",
}

export enum ProcessorCookie {
    Set = "processor_cookie_set",
    Clear = "processor_cookie_clear",
}

export enum ProcessorData {
    Data = 'processor_data_default'
    // Text = "processor_data_text",
    // Excel = "processor_data_excel",
    // ZenData = "processor_data_zendata",
}

export enum ProcessorCustomCode {
    CustomCodeDefault = "processor_custom_code",
}

export enum RequestBodyType {
    'application/json'= 'application/json',
    'application/xml' = 'application/xml',
    'multipart/form-data' = 'multipart/form-data',
    'application/x-www-form-urlencoded' = 'application/x-www-form-urlencoded',
    'text/html' = 'text/html',
    'text/plain' = 'text/plain',
}

export const Methods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "CONNECT",
    "OPTIONS",
    "TRACE",
    "CUSTOM",
]

export enum ComparisonOperator {
    // empty = 'empty',
    equal = 'equal',
    notEqual = 'notEqual',
    greaterThan = 'greaterThan',
    lessThan = 'lessThan',
    greaterThanOrEqual = 'greaterThanOrEqual',
    lessThanOrEqual = 'lessThanOrEqual',

    contain = 'contain',
    notContain = 'notContain',
}

export enum DataSrc {
    fileUpload = 'fileUpload',
    datapool = 'datapool',
}

export enum ConditionCategory {
    result = 'result',
    preCondition = 'preCondition',
    postCondition = 'postCondition',
    console = 'console',
    assert = 'assert'
}
export enum ConditionType {
    extractor = 'extractor',
    checkpoint = 'checkpoint',
    script = 'script',
    cookie = 'cookie',
    databaseOpt= 'databaseOpt'
}
export enum ConditionSrc {
    PreCondition = "pre_condition",
    PostCondition = "post_condition",
    ScenarioCustomCode = "scenario_custom_code",
}

export enum ExtractorSrc {
    header = 'header',
    body = 'body',
    cookie = 'cookie',
}
export enum ExtractorType {
    boundary = 'boundary',
    jsonpath = 'jsonpath',
    jsonquery = 'jsonquery',
    htmlquery = 'htmlquery',
    xmlquery = 'xmlquery',
    regx = 'regx',
    // fulltext = 'fulltext',
}
export enum CheckpointType {
    responseStatus = 'responseStatus',
    responseHeader = 'responseHeader',
    responseBody = 'responseBody',
    judgement = 'judgement',
    extractorVari = 'extractorVari',
    extractor = 'extractor',
}

export enum AuthorizationTypes {
    '' = 'None',
    'basicAuth' = 'Basic Auth',
    'bearerToken' = 'Bearer Token',
    'apiKey' = 'API Key',
    // 'oAuth2' = 'OAuth 2.0',
}

export enum OAuth2GrantTypes {
    'authorizationCode' = 'Authorization Code',
    'authorizationCodeWithPKCE' = 'Authorization Code (With PKCE)',
    'implicit' = 'Implicit',
    'passwordCredential' = 'Password Credential',
    'clientCredential' = 'Client Credential',
}

export enum OAuth2ClientAuthenticationWay {
    'sendAsBasicAuthHeader' = 'Send as Basic Auth header',
    'sendClientCredentialsInBody' = 'Send client credentials in body',
}

export enum ReportDetailType {
    ExecPlan = 'exec_plan',
    ExecScenario = 'exec_scenario',
    QueryDetail = 'query_detail'
}

export enum ProjectType {
    Full = 'full',
    Debug = 'debug'
}

export enum DataFileExt {
//    XLS = '.xls',
//    XLSX = '.xlsx',
    CSV = '.csv',
//    TXT = '.txt'
}


export enum ChangedStatus {
    NoChanged = 1,
    Changed = 2,
    IgnoreChanged = 3
}

export enum SourceType {
    SwaggerSync = 1,
    SwaggerImport = 2,
    ThirdPartySync = 3
}

export enum MetricsType {
    summarization = "summarization",
    answer_relevancy = "answer_relevancy",
    faithfulness = "faithfulness",
    contextual_precision = "contextual_precision",
    contextual_recall = "contextual_recall",
    contextual_relevancy = "contextual_relevancy",
    hallucination = "hallucination",
    bias = "bias",
    toxicity = "toxicity",
}

export enum MetricsFields {
    summarization = "actual_output; threshold,include_reason,strict_mode",
    answer_relevancy = "actual_output; threshold,include_reason,strict_mode",
    faithfulness = "retrieval_context,actual_output; threshold,include_reason,strict_mode",
    contextual_precision = "retrieval_context,actual_output,expected_output; threshold,include_reason,strict_mode",
    contextual_recall = "retrieval_context,actual_output,expected_output; threshold,include_reason,strict_mode",
    contextual_relevancy = "retrieval_context,actual_output; threshold,include_reason,strict_mode",
    hallucination = "context,actual_output; threshold,include_reason,strict_mode",
    bias = "actual_output; threshold,include_reason,strict_mode",
    toxicity = "actual_output; threshold,include_reason,strict_mode",
}
export enum MetricsFieldDefine {
    // input = "input",
    expected_output = "expected_output",

    threshold = "threshold",
    include_reason = "include_reason",
    strict_mode = "strict_mode",

    // actual_output = "actual_output",
    // retrieval_context = "retrieval_context",
}