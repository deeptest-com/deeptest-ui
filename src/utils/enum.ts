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

export const designForKey = 'designFor'
export enum DesignScenarioFor {
    FunctionalTest = "functional_test",
    PerformanceTest = "performance_test",
}

export enum PerformanceGeneratorType {
    Constant = "constant",
    Ramp = "ramp",
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
    NotStart = "not_start",
    InProgress = "in_progress",
    End = "end",
    Result = "result",
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

    PerformanceGoal = "processor_performance_goal",
    PerformanceRunners = "processor_performance_runners",
    PerformanceScenarios = "processor_performance_scenarios",
    PerformanceRunner = "processor_performance_runner",
    PerformanceScenario = "processor_performance_scenario",
    PerformanceRendezvous = "processor_performance_rendezvous",
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

export enum ProcessorPerformanceGoal {
   PerformanceGoalDefault = "processor_performance_goal_default",
}

export enum ProcessorPerformanceRunners {
    PerformanceRunnersDefault = "processor_performance_runners_default",
}
export enum ProcessorPerformanceScenarios {
    PerformanceScenariosDefault = "processor_performance_scenarios_default",
}
export enum ProcessorPerformanceRunner {
    PerformanceRunnerDefault = "processor_performance_runner_default",
}
export enum ProcessorPerformanceScenario {
    PerformanceScenarioDefault = "processor_performance_scenario_default",
}
export enum ProcessorPerformanceRendezvous {
    PerformanceRendezvousDefault = "processor_performance_rendezvous_default",
}

export enum PerformanceGenerateType {
    Constant = "constant",
    Ramp = "ramp",
}
export enum PerformanceGoalType {
    Duration = "duration",
    Loop = "loop",
    ResponseTime = "responseTime",
    Qps = "qps",
    FailRate = "failRate",
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

export enum MsgCategory {
    Instruction  = "instruction",
    Result       = "result",
    Log          = "log",
}

export enum MsgInstruction {
    JoinExist       = "joinExist",
    Start           = "start",
    End             = "end",
    Terminal        = "terminal",
    Running  = "alreadyRunning",
    Exception       = "exception",
}

