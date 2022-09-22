<%--
~ Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
~
~  WSO2 LLC. licenses this file to you under the Apache License,
~  Version 2.0 (the "License"); you may not use this file except
~  in compliance with the License.
~  You may obtain a copy of the License at
~
~    http://www.apache.org/licenses/LICENSE-2.0
~
~ Unless required by applicable law or agreed to in writing,
~ software distributed under the License is distributed on an
~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
~ KIND, either express or implied.  See the License for the
~ specific language governing permissions and limitations
~ under the License.
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.apache.commons.lang.StringUtils" %>
<%@ page import="org.wso2.carbon.base.MultitenantConstants" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.client.ApiException" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.client.api.SelfRegisterApi" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.client.model.User" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.client.model.Property" %>
<%@ page import="org.wso2.carbon.identity.mgt.endpoint.util.client.model.ResendCodeRequest" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<jsp:directive.include file="includes/localize.jsp"/>

<!-- Include tenant context -->
<jsp:directive.include file="tenant-resolve.jsp"/>
<%
	String username = request.getParameter("username");
        String callback = (String)request.getParameter("callback");
        String spId = request.getParameter("spId");
        String realm = (String)request.getParameter("userstoredomain");
        boolean isSaaSApp = Boolean.parseBoolean(request.getParameter("isSaaSApp"));
        String gRecaptchaResponse = (String)request.getParameter("g-recaptcha-response");

        User user = new User();
        user.setUsername(username);
        user.setTenantDomain(tenantDomain);
        user.setRealm(realm);

        SelfRegisterApi selfRegisterApi = new SelfRegisterApi();
        ResendCodeRequest resendCodeRequest = new ResendCodeRequest();
        List<Property> properties = new ArrayList<>();

        Property tenantDomainProperty = new Property();
        tenantDomainProperty.setKey(MultitenantConstants.TENANT_DOMAIN);
        tenantDomainProperty.setValue(tenantDomain);

        Property spIdProperty = new Property();
        spIdProperty.setKey("spId");
        spIdProperty.setValue(spId);

        Property callbackProperty = new Property();
        callbackProperty.setKey("callback");
        callbackProperty.setValue(callback);

        properties.add(tenantDomainProperty);
        properties.add(spIdProperty);
        properties.add(callbackProperty);

        resendCodeRequest.setProperties(properties);
        resendCodeRequest.setUser(user);

        Map<String, String> headers = new HashMap<String, String>();
        if (StringUtils.isNotEmpty(gRecaptchaResponse)) {
            headers.put("g-recaptcha-response", gRecaptchaResponse);
        }

        try {
            selfRegisterApi.resendCodePostCall(resendCodeRequest, headers);
            request.setAttribute("username", username);
            request.getRequestDispatcher("/emailsendsuccess.do").forward(request, response);
        } catch (ApiException e) {
            request.setAttribute("spId", spId);
            request.setAttribute("isSaaSApp", isSaaSApp);
            request.getRequestDispatcher("error.jsp").forward(request, response);
        }
%>
