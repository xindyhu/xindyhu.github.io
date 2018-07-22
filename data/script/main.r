library(dplyr)
#purpose: aggregate UCMR3 data by compound and PWSID
#merge UCMR3 data with SDWIS for population count by PWSID

df<-read.csv('UCMR3_All.csv',header = TRUE,stringsAsFactors = F)
df<-df[!df$State%in%c('01','05','06','08','09','10','AS','GU','MP','PR','VI','NN'),]


sdwis<-read.csv('EnvirofactsRestAPI.CSV',header=TRUE)[ ,c('WATER_SYSTEM.PWSID', 'WATER_SYSTEM.POPULATION_SERVED_COUNT')]
colnames(sdwis)<-c('PWSID','POPULATION_SERVED_COUNT')
df2<-subset(df,select=c(PWSID, CollectionDate, SampleID, Contaminant, MRL, AnalyticalResultsSign, AnalyticalResultValue))

#for non-detect, substitue with MRL/SQRT(2)
df2$AnalyticalResultValue[df2$AnalyticalResultsSign=="<"]<-0#df2$MRL[df2$AnalyticalResultsSign=="<"]/sqrt(2)
# summary(df2$AnalyticalResultValue/df2$MRL)
# quantile(df2$AnalyticalResultValue/df2$MRL, 0.95) # get a sense of how many times MRL concentration is 
# #95th percentile is 160, so indices can be 
# #<MRL, 0
# #(1-10)*MRL, 1
# #(11-100)*MRL, 2
# #(101-1000)*MRL, 3
# #(1001-10000)*MRL, 4
# #(>10000)*MRL, 5
# df2$indices<-log10(df2$AnalyticalResultValue/df2$MRL)
# df2$indices[df2$AnalyticalResultValue<df2$MRL]<-0
# df2$indices[(df2$AnalyticalResultValue/df2$MRL>=1) & (df2$AnalyticalResultValue/df2$MRL<10)]<-1
# df2$indices[(df2$AnalyticalResultValue/df2$MRL>=10) & (df2$AnalyticalResultValue/df2$MRL<100)]<-2
# df2$indices[(df2$AnalyticalResultValue/df2$MRL>=100) & (df2$AnalyticalResultValue/df2$MRL<1000)]<-3
# df2$indices[(df2$AnalyticalResultValue/df2$MRL>=1000) & (df2$AnalyticalResultValue/df2$MRL<10000)]<-4
# df2$indices[(df2$AnalyticalResultValue/df2$MRL>=10000)]<-5
#summary(df2$indices)
# 0      1      2      3      4      5 
# 799816 135350  51654  42473  17953    525 

#drop MRL and AnalyticalResultsSign
#df2<-subset(df2,select=-c(MRL,AnalyticalResultsSign))
df2<-left_join(df2,sdwis,by='PWSID')
df2$AnalyticalResultsSign[df2$AnalyticalResultsSign=='=']<-1
df2$AnalyticalResultsSign[df2$AnalyticalResultsSign=='<']<-0
write.csv(df2,'UCMR3_reduced_sens.csv')
